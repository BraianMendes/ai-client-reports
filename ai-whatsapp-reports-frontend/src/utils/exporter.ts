import jsPDF from "jspdf";

export function exportMarkdown(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

export function exportPDF(title: string, content: string) {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
    });
    doc.setFont("helvetica");
    doc.setFontSize(16);
    doc.text(title, 40, 60);
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(content, 500);
    doc.text(lines, 40, 100);
    doc.save(`${title.replace(/\s+/g, "_") || "report"}.pdf`);
}