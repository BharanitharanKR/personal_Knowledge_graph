/**
 * Sedge is a local-first fork with no account service and no subscription tier.
 *
 * Upstream used these two helpers to gate features behind a paid plan. Every
 * feature they guarded runs entirely on the user's own machine, so with the
 * billing service removed there is nothing left to protect. They are kept as
 * stubs rather than deleted so the ~19 call sites stay readable as a diff
 * against upstream, which matters when merging future SiYuan releases.
 */

/** Always false in Sedge: nothing requires a subscription. */
export const needSubscribe = (_tip?: string) => {
    return false;
};

/** Always true in Sedge: all sync providers are available to everyone. */
export const isPaidUser = () => {
    return true;
};
