/**
 * Export utilities for Analytics and Reports
 */

// ──── CSV Export ─────────────────────────────────────────────────────────────

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    throw new Error("No data to export");
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvRows = [
    headers.join(","), // Header row
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Handle values with commas, quotes, or newlines
        if (value === null || value === undefined) return "";
        const str = String(value);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(",")
    ),
  ];

  const csvContent = csvRows.join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ──── PDF Export (using jsPDF) ──────────────────────────────────────────────

export async function exportToPDF(title: string, data: any[], filename: string, summary?: Record<string, any>) {
  try {
    // Dynamic import to avoid SSR issues
    const { jsPDF } = await import("jspdf");
    
    // Import autoTable - this extends jsPDF with the autoTable method
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF() as any;
    
    // Add title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, 22);
    
    // Add date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    let startY = 40;

    // Add summary if provided
    if (summary && Object.keys(summary).length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Summary", 14, startY);
      startY += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      Object.entries(summary).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          const label = key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
          doc.text(`${label}: ${value}`, 14, startY);
          startY += 6;
        }
      });

      startY += 6;
    }

    if (!data || data.length === 0) {
      doc.setFontSize(12);
      doc.text("No data available", 14, startY);
      doc.save(`${filename}.pdf`);
      return;
    }

    // Create table
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => {
      const val = row[h];
      return val === null || val === undefined ? "—" : String(val);
    }));

    // Use autoTable
    autoTable(doc, {
      head: [headers.map(h => h.replace(/_/g, " ").toUpperCase())],
      body: rows,
      startY,
      styles: { 
        fontSize: 8, 
        cellPadding: 3,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      headStyles: { 
        fillColor: [212, 175, 55], 
        textColor: [26, 26, 26],
        fontStyle: 'bold',
        halign: 'left'
      },
      alternateRowStyles: { fillColor: [249, 249, 249] },
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      theme: 'grid',
    });

    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error("PDF Export Error:", error);
    throw new Error("Failed to generate PDF. Please try again.");
  }
}
