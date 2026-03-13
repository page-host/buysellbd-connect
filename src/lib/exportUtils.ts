import * as XLSX from "xlsx";

interface ExportColumn {
  header: string;
  key: string;
  transform?: (value: any, row: any) => string;
}

export function exportToExcel(data: any[], columns: ExportColumn[], filename: string) {
  const rows = data.map(row =>
    columns.reduce((acc, col) => {
      acc[col.header] = col.transform ? col.transform(row[col.key], row) : (row[col.key] ?? "");
      return acc;
    }, {} as Record<string, any>)
  );

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export async function exportToPDF(data: any[], columns: ExportColumn[], title: string, filename: string) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape" });
  
  // Title
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

  const headers = columns.map(c => c.header);
  const rows = data.map(row =>
    columns.map(col => col.transform ? col.transform(row[col.key], row) : String(row[col.key] ?? ""))
  );

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 28,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  doc.save(`${filename}.pdf`);
}
