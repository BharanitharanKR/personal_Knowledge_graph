import {describe, it} from "node:test";
import * as assert from "node:assert/strict";
import {escapeAVItemLinkText, formatAVItemLinks, genAVItemLink} from "./itemLink";

describe("database item links", () => {
    it("generates links with the current item location", () => {
        assert.equal(
            genAVItemLink("database-id", "view-id", "item-id"),
            "sedge://blocks/database-id?avViewID=view-id&avItemID=item-id",
        );
        assert.equal(
            genAVItemLink("database-id", "view-id", "item-id", "group-id"),
            "sedge://blocks/database-id?avViewID=view-id&avItemID=item-id&avGroupID=group-id",
        );
    });

    it("formats multiple hyperlinks as an unordered list", () => {
        assert.equal(formatAVItemLinks([
            {content: "Item 1", link: "sedge://item-1"},
            {content: "Item 2", link: "sedge://item-2"},
        ], false), "- sedge://item-1\n- sedge://item-2");
    });

    it("uses escaped primary key text in Markdown links", () => {
        assert.equal(
            escapeAVItemLinkText("Line 1\r\nLine \\[2] and [3]"),
            "Line 1 Line \\\\\\[2\\] and \\[3\\]",
        );
        assert.equal(formatAVItemLinks([
            {content: "Line 1\nLine [2]", link: "sedge://item-1"},
            {content: "", link: "sedge://item-2"},
        ], true), "- [Line 1 Line \\[2\\]](sedge://item-1)\n- [sedge://item-2](sedge://item-2)");
    });

    it("does not add a list marker for one item", () => {
        assert.equal(
            formatAVItemLinks([{content: "Item", link: "sedge://item"}], true),
            "[Item](sedge://item)",
        );
    });
});
