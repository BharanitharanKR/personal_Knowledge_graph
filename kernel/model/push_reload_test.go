// Sedge - A local-first knowledge base
// Copyright (c) 2020-present, b3log.org
// Copyright (c) 2026-present, Bharanitharan KR
//
// This file is part of Sedge, a fork of SiYuan (https://github.com/siyuan-note/siyuan).
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

package model

import (
	"path/filepath"
	"testing"

	"github.com/BharanitharanKR/personal_Knowledge_graph/kernel/util"
)

func TestPluginStorageName(t *testing.T) {
	originalDataDir := util.DataDir
	util.DataDir = filepath.Join(t.TempDir(), "data")
	t.Cleanup(func() {
		util.DataDir = originalDataDir
	})

	tests := []struct {
		name       string
		path       string
		pluginName string
		ok         bool
	}{
		{
			name:       "nested plugin data",
			path:       filepath.Join(util.DataDir, "storage", "petal", "sample", "nested", "data.json"),
			pluginName: "sample",
			ok:         true,
		},
		{
			name:       "plugin storage root",
			path:       filepath.Join(util.DataDir, "storage", "petal", "sample"),
			pluginName: "sample",
			ok:         true,
		},
		{
			name: "petal configuration",
			path: filepath.Join(util.DataDir, "storage", "petal", "petals.json"),
		},
		{
			name: "petal storage root",
			path: filepath.Join(util.DataDir, "storage", "petal"),
		},
		{
			name: "other storage",
			path: filepath.Join(util.DataDir, "storage", "local.json"),
		},
		{
			name: "outside data directory",
			path: filepath.Join(filepath.Dir(util.DataDir), "outside.json"),
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			pluginName, ok := pluginStorageName(test.path)
			if test.pluginName != pluginName || test.ok != ok {
				t.Fatalf("expected plugin name [%s] and ok [%v], got [%s] and [%v]",
					test.pluginName, test.ok, pluginName, ok)
			}
		})
	}
}
