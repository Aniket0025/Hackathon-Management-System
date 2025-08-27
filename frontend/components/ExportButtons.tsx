"use client";

import React, { useCallback } from "react";
import { exportElementAsImage, exportJsonToExcel, exportTableToExcel } from "@/lib/export";

type ExportButtonsProps = {
  // The id of the element to capture as an image
  captureElementId?: string;
  // Filename overrides
  imageFilename?: string;
  jsonFilename?: string;
  tableFilename?: string;
  // Optional JSON data to export
  jsonData?: Record<string, any>[];
  // Optional sheet names
  jsonSheetName?: string;
  tableSheetName?: string;
  // The id of the table element to export (if using table export)
  tableElementId?: string;
  className?: string;
};

export default function ExportButtons(props: ExportButtonsProps) {
  const {
    captureElementId = "capture-area",
    imageFilename = "export.png",
    jsonFilename = "export.xlsx",
    tableFilename = "table.xlsx",
    jsonData,
    jsonSheetName = "Sheet1",
    tableSheetName = "TableSheet",
    tableElementId = "export-table",
    className,
  } = props;

  const onExportImage = useCallback(async () => {
    try {
      await exportElementAsImage(captureElementId, imageFilename);
    } catch (e) {
      console.error(e);
      alert((e as Error).message || "Failed to export image");
    }
  }, [captureElementId, imageFilename]);

  const onExportJson = useCallback(async () => {
    try {
      const data = jsonData ?? [];
      if (!data.length) {
        alert("No JSON data provided to export.");
        return;
      }
      await exportJsonToExcel(data, jsonFilename, jsonSheetName);
    } catch (e) {
      console.error(e);
      alert((e as Error).message || "Failed to export Excel");
    }
  }, [jsonData, jsonFilename, jsonSheetName]);

  const onExportTable = useCallback(async () => {
    try {
      await exportTableToExcel(tableElementId, tableFilename, tableSheetName);
    } catch (e) {
      console.error(e);
      alert((e as Error).message || "Failed to export table");
    }
  }, [tableElementId, tableFilename, tableSheetName]);

  return (
    <div className={className}>
      <div className="flex gap-2 flex-wrap">
        <button onClick={onExportImage} className="px-3 py-2 rounded bg-black text-white">
          Export Element as PNG
        </button>
        <button onClick={onExportJson} className="px-3 py-2 rounded bg-emerald-600 text-white">
          Export JSON to Excel
        </button>
        <button onClick={onExportTable} className="px-3 py-2 rounded bg-indigo-600 text-white">
          Export Table to Excel
        </button>
      </div>
    </div>
  );
}
