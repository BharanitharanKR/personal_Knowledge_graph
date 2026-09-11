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

package cmd

import (
	"testing"

	"github.com/BharanitharanKR/personal_Knowledge_graph/kernel/model"
)

func TestNewAssetUploadCommandOutputPreservesPartialResults(t *testing.T) {
	succeeded := []model.AssetUploadSuccess{{Index: 0, Name: "good.png", Path: "assets/good.png"}}
	failed := []model.AssetUploadFailure{{Index: 1, Name: "missing.png", Error: "file not found"}}

	result := newAssetUploadCommandOutput(succeeded, failed)

	if result.Status != "partial" {
		t.Fatalf("status = %q, want partial", result.Status)
	}
	if len(result.Succeeded) != 1 || result.Succeeded[0].Path != "assets/good.png" {
		t.Fatalf("succeeded = %#v", result.Succeeded)
	}
	if len(result.Failed) != 1 || result.Failed[0].Name != "missing.png" {
		t.Fatalf("failed = %#v", result.Failed)
	}
}
