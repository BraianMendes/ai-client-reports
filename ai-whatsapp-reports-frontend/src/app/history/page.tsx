"use client";
import { useState } from "react";
import {
    Card,
} from "@heroui/react";
import { Trash, Search, Eye, Download, FileText, ClipboardCopy } from "lucide-react";
import { useReports, Report } from "@/hooks/useReports";
import { exportMarkdown, copyToClipboard, exportPDF } from "@/utils/exporter";

function SimpleModal({ open, onClose, title, date, content }: {
    open: boolean;
    onClose: () => void;
    title?: string;
    date?: string;
    content?: string;
}) {
    const [copied, setCopied] = useState(false);

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-neutral-900 rounded-2xl shadow-xl w-[80vw] max-w-4xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-200"
                    aria-label="Fechar"
                >
                    ×
                </button>
                <div className="text-xl font-bold text-neutral-50">{title}</div>
                <div className="text-xs text-neutral-400 mt-1">{date}</div>
                <div className="flex gap-2 mt-3">
                    <button
                        type="button"
                        title="Export as PDF"
                        className="rounded-lg border border-blue-600 text-blue-400 hover:bg-blue-600/10 px-2 py-1 flex items-center text-xs"
                        onClick={() => exportPDF(title || "Report", content || "")}
                    >
                        <Download size={14} className="mr-1" /> PDF
                    </button>
                    <button
                        type="button"
                        title="Export as Markdown"
                        className="rounded-lg border border-emerald-600 text-emerald-400 hover:bg-emerald-600/10 px-2 py-1 flex items-center text-xs"
                        onClick={() =>
                            exportMarkdown(
                                (title?.replace(/\s+/g, "_") || "report") + ".md",
                                "# " + (title || "Report") + "\n\n" + (content || "")
                            )
                        }
                    >
                        <FileText size={14} className="mr-1" /> MD
                    </button>
                    <button
                        type="button"
                        title="Copy to Clipboard"
                        className="rounded-lg border border-violet-600 text-violet-400 hover:bg-violet-600/10 px-2 py-1 flex items-center text-xs"
                        onClick={async () => {
                            await copyToClipboard(content || "");
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1200);
                        }}
                    >
                        <ClipboardCopy size={14} className="mr-1" />
                        {copied ? "Copied!" : "Copy"}
                    </button>
                </div>
                <div className="text-neutral-200 whitespace-pre-line max-h-[60vh] overflow-auto mt-4">{content}</div>
                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="rounded-xl text-neutral-200 hover:bg-neutral-700/20 transition px-4 h-10"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

function ConfirmModal({ open, onClose, onConfirm, message }: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
}) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-neutral-900 rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
                <div className="text-neutral-50 text-lg mb-4">{message}</div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-xl text-neutral-200 hover:bg-neutral-700/20 transition px-4 h-10"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="rounded-xl text-red-500 hover:bg-red-900/20 transition px-4 h-10"
                    >
                        Yes
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function HistoryScreen() {
    const { reports, removeReport, clearAll } = useReports();
    const [search, setSearch] = useState("");
    const [modalReport, setModalReport] = useState<Report | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAllOpen, setConfirmAllOpen] = useState(false);
    const [toDeleteId, setToDeleteId] = useState<string | null>(null);

    const filtered = search
        ? reports.filter(r =>
            r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.content.toLowerCase().includes(search.toLowerCase())
        )
        : reports;

    return (
        <main className="flex flex-col items-center min-h-screen w-full bg-neutral-950 px-4 py-10">
            <section className="w-full max-w-4xl space-y-6 mt-16">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-50 mb-4">Report History</h1>
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                        <div className="relative flex-1 flex items-center">
                            <input
                                type="text"
                                placeholder="Search reports..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-11 bg-neutral-900/80 border border-neutral-700 rounded-2xl text-neutral-100 h-11 w-full outline-none"
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center">
                                <Search size={18} />
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setConfirmAllOpen(true)}
                            className="rounded-2xl text-red-500 hover:bg-red-900/20 transition flex items-center px-4 h-11"
                        >
                            <Trash className="mr-1" size={16} />
                            Clear all
                        </button>
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    {filtered.length === 0 && (
                        <Card className="bg-neutral-900/70 text-neutral-400 h-24 flex items-center justify-center rounded-2xl shadow-inner">
                            <div>No reports found.</div>
                        </Card>
                    )}
                    {filtered.map(report => {
                        const titleWords = report.title.trim().split(" ");
                        const clientName = titleWords[titleWords.length - 1];
                        return (
                            <Card
                                key={report.id}
                                className="bg-neutral-900 rounded-2xl shadow hover:shadow-lg border border-neutral-800"
                            >
                                <div className="p-6 flex justify-between items-center gap-4">
                                    <div>
                                        <div className="text-lg font-semibold text-neutral-50 mb-1">
                                            {clientName}
                                        </div>
                                        <div className="text-xs text-neutral-400 italic mb-1">
                                            {report.title}
                                        </div>
                                        <div className="text-xs text-neutral-400">
                                            {new Date(report.date).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end">
                                        <div className="flex gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setModalReport(report)}
                                                className="rounded-xl text-blue-500 hover:bg-blue-800/10 transition flex items-center px-3 h-9"
                                            >
                                                <Eye size={16} className="mr-1" />
                                                View
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setToDeleteId(report.id);
                                                    setConfirmOpen(true);
                                                }}
                                                className="rounded-xl text-red-500 hover:bg-red-900/20 transition flex items-center px-3 h-9"
                                                aria-label="Delete"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                type="button"
                                                title="Export as PDF"
                                                className="rounded-lg border border-blue-600 text-blue-400 hover:bg-blue-600/10 px-2 py-1 flex items-center text-xs"
                                                onClick={() => exportPDF(report.title, report.content)}
                                            >
                                                <Download size={14} className="mr-1" /> PDF
                                            </button>
                                            <button
                                                type="button"
                                                title="Export as Markdown"
                                                className="rounded-lg border border-emerald-600 text-emerald-400 hover:bg-emerald-600/10 px-2 py-1 flex items-center text-xs"
                                                onClick={() =>
                                                    exportMarkdown(
                                                        (report.title.replace(/\s+/g, "_") || "report") + ".md",
                                                        "# " + (report.title || "Report") + "\n\n" + report.content
                                                    )
                                                }
                                            >
                                                <FileText size={14} className="mr-1" /> MD
                                            </button>
                                            <button
                                                type="button"
                                                title="Copy to Clipboard"
                                                className="rounded-lg border border-violet-600 text-violet-400 hover:bg-violet-600/10 px-2 py-1 flex items-center text-xs"
                                                onClick={async () => {
                                                    await copyToClipboard(report.content);
                                                    setCopiedId(report.id);
                                                    setTimeout(() => setCopiedId(null), 1200);
                                                }}
                                            >
                                                <ClipboardCopy size={14} className="mr-1" />
                                                {copiedId === report.id ? "Copied!" : "Copy"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </section>
            <SimpleModal
                open={!!modalReport}
                onClose={() => setModalReport(null)}
                title={modalReport?.title}
                date={modalReport ? new Date(modalReport.date).toLocaleString() : undefined}
                content={modalReport?.content}
            />
            <ConfirmModal
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={() => {
                    if (toDeleteId) removeReport(toDeleteId);
                }}
                message="Are you sure you want to delete this report?"
            />
            <ConfirmModal
                open={confirmAllOpen}
                onClose={() => setConfirmAllOpen(false)}
                onConfirm={clearAll}
                message="Are you sure you want to delete all reports?"
            />
        </main>
    );
}
