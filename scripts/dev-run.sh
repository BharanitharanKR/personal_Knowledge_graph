#!/usr/bin/env bash
# Run Sedge locally in development.
#
# Why this script exists: in dev mode Electron does NOT spawn the kernel itself
# (see app/electron/main.js, the `if (!isDevEnv || workspaces.length > 0)` guard
# around childProcess.spawn). It just connects to whatever is listening on the
# kernel port. So the kernel has to be started first, or the UI sits retrying --
# or worse, silently attaches to another SiYuan/Sedge kernel already on that port.
#
# Usage:
#   scripts/dev-run.sh                 # build kernel if needed, run with ~/Sedge
#   scripts/dev-run.sh --rebuild       # force a kernel rebuild first
#   scripts/dev-run.sh --port 6810     # use a different port
#   scripts/dev-run.sh --workspace DIR # use a different workspace
#   scripts/dev-run.sh --stop          # stop a running dev instance

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP="$ROOT/app"
KERNEL_BIN="$APP/kernel/Sedge-Kernel"
PORT=6806
WORKSPACE="$HOME/Sedge"
REBUILD=0

while [ $# -gt 0 ]; do
  case "$1" in
    --rebuild)   REBUILD=1; shift ;;
    --port)      PORT="$2"; shift 2 ;;
    --workspace) WORKSPACE="$2"; shift 2 ;;
    --stop)
      # Match on the binary name, not an absolute path: the kernel may have been
      # started with a relative path, which an absolute-path pattern never matches.
      pkill -f "Sedge-Kernel serve" 2>/dev/null || true
      pkill -f "electron/main.js" 2>/dev/null || true
      sleep 1
      if lsof -iTCP:"$PORT" -sTCP:LISTEN -P >/dev/null 2>&1; then
        echo "Warning: something is still listening on port $PORT." >&2
        lsof -iTCP:"$PORT" -sTCP:LISTEN -P 2>/dev/null | awk 'NR==2 {print "  "$1" (pid "$2")"}' >&2
      else
        echo "Sedge stopped."
      fi
      exit 0 ;;
    -h|--help)  sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done

# --- refuse to start if something else already owns the port -----------------
# This is the failure that silently attaches the UI to another app's kernel.
if lsof -iTCP:"$PORT" -sTCP:LISTEN -P >/dev/null 2>&1; then
  owner=$(lsof -iTCP:"$PORT" -sTCP:LISTEN -P 2>/dev/null | awk 'NR==2 {print $1" (pid "$2")"}')
  echo "Port $PORT is already in use by: $owner" >&2
  echo "" >&2
  echo "If that is SiYuan or another Sedge instance, quit it first, or pick" >&2
  echo "another port:  scripts/dev-run.sh --port 6810" >&2
  exit 1
fi

# --- kernel ------------------------------------------------------------------
if [ "$REBUILD" = "1" ] || [ ! -x "$KERNEL_BIN" ]; then
  echo "Building kernel..."
  mkdir -p "$APP/kernel"
  (cd "$ROOT/kernel" && go build -tags "fts5" -o "$KERNEL_BIN" .)
fi

# --- frontend bundles --------------------------------------------------------
if [ ! -f "$APP/stage/build/app/index.html" ]; then
  echo "Building frontend (first run only)..."
  (cd "$APP" && pnpm install && pnpm run build)
fi

mkdir -p "$WORKSPACE"
echo "Starting kernel  port=$PORT  workspace=$WORKSPACE"
"$KERNEL_BIN" serve --port "$PORT" --wd "$APP" --attach-ui --mode dev \
  --workspace "$WORKSPACE" > "${TMPDIR:-/tmp}/sedge-kernel.log" 2>&1 &
KERNEL_PID=$!
trap 'kill $KERNEL_PID 2>/dev/null || true' EXIT

for _ in $(seq 1 60); do
  if curl -sf -m 2 -X POST "http://127.0.0.1:$PORT/api/system/version" \
       -H 'Content-Type: application/json' -d '{}' >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -sf -m 2 -X POST "http://127.0.0.1:$PORT/api/system/version" \
      -H 'Content-Type: application/json' -d '{}' >/dev/null 2>&1; then
  echo "Kernel failed to start. Log:" >&2
  tail -20 "${TMPDIR:-/tmp}/sedge-kernel.log" >&2
  exit 1
fi
echo "Kernel ready."

# --- UI ----------------------------------------------------------------------
# ELECTRON_RUN_AS_NODE forces Electron into plain-Node mode, where `app` is
# undefined and main.js dies on app.getAppPath(). Clear it for the child.
echo "Starting UI..."
cd "$APP"
env -u ELECTRON_RUN_AS_NODE NODE_ENV=development \
  ./node_modules/electron/dist/Electron.app/Contents/MacOS/Electron ./electron/main.js

echo "UI closed; stopping kernel."
