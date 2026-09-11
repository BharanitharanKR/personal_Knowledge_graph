import type {SettingTabBuilder} from "../setting/builder";
import {Constants} from "../../constants";
import {fetchPost} from "../../util/fetch";
import {REPO_URL} from "../util/about";
import {sendAppSetting} from "./appRuntime";
import {getHostCapabilities} from "../../util/hostCapabilities";
import {openChangelog} from "../../boot/openChangelog";

const registerAboutVersionGroup = (tab: SettingTabBuilder) => {
    const group = tab.group("version", "");

    group.slot({
        key: "version",
        keywords: [
            window.siyuan.languages.currentVer,
            window.siyuan.languages.downloadLatestVer,
            window.siyuan.languages.isMsStoreVerTip,
            window.siyuan.languages.checkUpdate,
            window.siyuan.languages.updateChannel,
            window.siyuan.languages.updateChannelTip,
            window.siyuan.languages.changelog,
            window.siyuan.languages.allChangelogs,
        ],
        html: genAboutVersionHtml,
        afterMount: mountAboutVersionSlot,
    });
    if (!window.siyuan.config.system.isMicrosoftStore && getHostCapabilities().ownsKernel) {
        group.select("system.updateChannel", {
            title: window.siyuan.languages.updateChannel,
            desc: window.siyuan.languages.updateChannelTip,
            options: [
                {value: "stable", label: window.siyuan.languages.updateChannelStable},
                {value: "beta", label: window.siyuan.languages.updateChannelBeta},
                {value: "alpha", label: window.siyuan.languages.updateChannelAlpha},
            ],
            save: (value) => sendAppSetting("system.updateChannel", value),
        });
    }
    /// #if !BROWSER
    if (!window.siyuan.config.system.isMicrosoftStore && getHostCapabilities().ownsKernel &&
        window.siyuan.config.system.container === "std" && window.siyuan.config.system.os !== "linux") {
        group.switch("system.downloadInstallPkg", {
            title: window.siyuan.languages.autoDownloadUpdatePkg,
            desc: window.siyuan.languages.autoDownloadUpdatePkgTip,
            save: (value) => sendAppSetting("system.downloadInstallPkg", value),
        });
    }
    /// #endif
};

const genAboutVersionHtml = (): string => {
    if (!getHostCapabilities().ownsKernel) {
        return `<div class="fn__flex b3-label config-item">
    <div class="fn__flex-1">
        ${genAboutVersionName()}
        <div class="b3-label__text">${genAllChangelogsLink()}</div>
    </div>
    <div class="fn__space"></div>
    ${genAboutVersionActions(false)}
</div>`;
    }
    if (window.siyuan.config.system.isMicrosoftStore) {
        return `<div class="fn__flex b3-label config-item">
    <div class="fn__flex-1">
        ${genAboutVersionName()}
        <div class="b3-label__text">${window.siyuan.languages.isMsStoreVerTip}<span class="fn__space"></span>${genAllChangelogsLink()}</div>
    </div>
    <div class="fn__space"></div>
    ${genAboutVersionActions(false)}
</div>`;
    }
    return `<div class="fn__flex b3-label config-item">
    <div class="fn__flex-1">
        ${genAboutVersionName()}
        <div class="b3-label__text">${window.siyuan.languages.downloadLatestVer}<span class="fn__space"></span>${genAllChangelogsLink()}</div>
    </div>
    <div class="fn__space"></div>
    ${genAboutVersionActions(true)}
</div>`;
};

const genAboutVersionName = () => `<div class="config-name">${window.siyuan.languages.currentVer} v${Constants.SIYUAN_VERSION}</div>`;

const genAllChangelogsLink = () => `<a href="https://github.com/BharanitharanKR/personal_Knowledge_graph/releases" target="_blank">${window.siyuan.languages.allChangelogs}</a>`;

const genAboutVersionActions = (showCheckUpdate: boolean) => `<div class="fn__flex-center fn__flex-column fn__size200">
    ${showCheckUpdate ? `<button id="checkUpdateBtn" class="b3-button b3-button--outline fn__block">
        <svg><use xlink:href="#iconRefresh"></use></svg>${window.siyuan.languages.checkUpdate}
    </button>
    <div class="fn__hr--small"></div>` : ""}
    <button id="viewChangelogBtn" class="b3-button b3-button--outline fn__block">
        <svg><use xlink:href="#iconFileText"></use></svg>${window.siyuan.languages.changelog}
    </button>
</div>`;

const mountAboutVersionSlot = (root: HTMLElement) => {
    root.querySelector("#viewChangelogBtn")?.addEventListener("click", () => {
        openChangelog(true);
    });
    const updateElement = root.querySelector("#checkUpdateBtn") as HTMLButtonElement | null;
    updateElement?.addEventListener("click", () => {
        const svgElement = updateElement.querySelector("svg");
        if (!svgElement || svgElement.classList.contains("fn__rotate")) {
            return;
        }
        svgElement.classList.add("fn__rotate");
        fetchPost("/api/system/checkUpdate", {showMsg: true}, () => {
            svgElement.classList.remove("fn__rotate");
        });
    });
};

const registerAboutInfoGroup = (tab: SettingTabBuilder) => {
    const group = tab.group("info", "");

    group.slot({
        key: "aboutLogo",
        keywords: [
            window.siyuan.languages.siyuanNote,
            window.siyuan.languages.slogan,
            "AGPL", "source", "licence", "license", "SiYuan",
        ],
        html: () => `<div class="fn__flex b3-label config-item">
    <div class="fn__flex-1">
        <div class="config-about__logo">
            <img src="/stage/icon.png">
            <span class="fn__space"></span>
            <span>${window.siyuan.languages.siyuanNote}</span>
            <span class="fn__space"></span>
            <span class="ft__on-surface">${window.siyuan.languages.slogan}</span>
        </div>
        <div class='fn__hr'></div>
        <div class="b3-label__text">
            Sedge is free software licensed under the
            <a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank">GNU AGPL v3</a>.
            The complete corresponding source is available at
            <a href="${REPO_URL}" target="_blank">${REPO_URL}</a>.
        </div>
        <div class='fn__hr'></div>
        <div class="b3-label__text">
            Sedge is a fork of <a href="https://github.com/siyuan-note/siyuan" target="_blank">SiYuan</a>,
            &copy; 2020-present b3log.org, also licensed under the AGPL v3.
        </div>
    </div>
</div>`,
    });
};

export const registerAboutTab = (tab: SettingTabBuilder) => {
    registerAboutVersionGroup(tab);
    registerAboutInfoGroup(tab);
};
