// Utility functions for exporting data and DOM elements
// All functions use dynamic imports to avoid SSR issues in Next.js

// Export a DOM element as a PNG image using html2canvas
export async function exportElementAsImage(
  elementId: string,
  filename: string = "export.png",
  options?: {
    scale?: number;
    backgroundColor?: string | null;
  }
): Promise<void> {
  if (typeof window === "undefined") throw new Error("exportElementAsImage must run on the client");
  const html2canvas = (await import("html2canvas")).default;

  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Element with id "${elementId}" not found`);

  const canvas = await html2canvas(el, {
    scale: options?.scale ?? 2,
    backgroundColor: options?.backgroundColor ?? null,
  });

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = filename;
  link.click();
}

// Export JSON data to an Excel file using xlsx + file-saver
export async function exportJsonToExcel(
  data: Record<string, any>[],
  filename: string = "export.xlsx",
  sheetName: string = "Sheet1"
): Promise<void> {
  if (typeof window === "undefined") throw new Error("exportJsonToExcel must run on the client");
  const XLSX = await import("xlsx");
  const { saveAs } = await import("file-saver");

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, filename);
}

// Export an HTML table (by id or element) to Excel using xlsx
export async function exportTableToExcel(
  tableOrId: string | HTMLTableElement,
  filename: string = "table.xlsx",
  sheetName: string = "TableSheet"
): Promise<void> {
  if (typeof window === "undefined") throw new Error("exportTableToExcel must run on the client");
  const XLSX = await import("xlsx");

  const tableEl: HTMLTableElement | null =
    typeof tableOrId === "string"
      ? (document.getElementById(tableOrId) as HTMLTableElement | null)
      : tableOrId;

  if (!tableEl) throw new Error("Table element not found");

  const worksheet = XLSX.utils.table_to_sheet(tableEl);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, filename);
}
