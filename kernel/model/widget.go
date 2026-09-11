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
	"os"
	"path/filepath"
	"strings"

	"github.com/siyuan-note/logging"
	"github.com/BharanitharanKR/personal_Knowledge_graph/kernel/bazaar"
	"github.com/BharanitharanKR/personal_Knowledge_graph/kernel/util"
)

// WidgetSearchResult 描述了挂件搜索结果。
type WidgetSearchResult struct {
	Name    string `json:"name"`
	Content string `json:"content"`
}

func SearchWidget(keyword string) (ret []*WidgetSearchResult) {
	ret = []*WidgetSearchResult{}
	widgetsDirPath := filepath.Join(util.DataDir, "widgets")
	widgetsDir, err := os.ReadDir(widgetsDirPath)
	if err != nil {
		logging.LogErrorf("read dir [%s] failed: %s", widgetsDirPath, err)
		return
	}

	var widgets []*bazaar.Package
	for _, dir := range widgetsDir {
		if !util.IsDirRegularOrSymlink(dir) {
			continue
		}
		dirName := dir.Name()
		if strings.HasPrefix(dirName, ".") {
			continue
		}

		widget, _ := bazaar.ParsePackageJSON(filepath.Join(widgetsDirPath, dirName, "widget.json"))
		if !bazaar.IsValidInstalledPackage(widget, dirName) {
			continue
		}

		widgets = append(widgets, widget)
	}

	widgets = bazaar.FilterPackages(widgets, keyword)
	for _, widget := range widgets {
		b := &WidgetSearchResult{
			Name:    bazaar.GetPreferredLocaleString(widget.DisplayName, widget.Name),
			Content: widget.Name,
		}
		ret = append(ret, b)
	}

	return
}
