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
	"testing"

	"github.com/88250/lute/ast"
	"github.com/BharanitharanKR/personal_Knowledge_graph/kernel/treenode"
)

func TestSetNodeAttrsClaimsFoldState(t *testing.T) {
	node := &ast.Node{Type: ast.NodeListItem, ID: "item"}
	node.SetIALAttr("fold", "1")
	node.SetIALAttr("heading-fold", "1")

	if _, err := setNodeAttrs0(node, map[string]string{"fold": "1"}, ""); nil != err {
		t.Fatal(err)
	}
	if !treenode.IsSelfFolded(node) {
		t.Fatal("explicit fold attribute should become self fold")
	}
	if "" != node.IALAttr("heading-fold") {
		t.Fatal("explicit fold attribute should remove legacy heading-fold")
	}

	node.SetIALAttr("heading-fold", "1")
	if _, err := setNodeAttrs0(node, map[string]string{"fold": ""}, ""); nil != err {
		t.Fatal(err)
	}
	if "" != node.IALAttr("fold") || "" != node.IALAttr("heading-fold") {
		t.Fatal("explicit unfold should remove both fold attributes")
	}
}
