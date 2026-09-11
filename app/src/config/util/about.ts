export const REPO_URL = "https://github.com/BharanitharanKR/personal_Knowledge_graph";

/**
 * Sedge has no hosted account/community service. Upstream pointed these at
 * ld246.com / liuyun.io / b3log.org; everything now resolves to the source repo.
 */
export const getCloudURL = (_key?: string) => {
    return REPO_URL;
};

export const getIndexURL = (_key?: string) => {
    return REPO_URL;
};
