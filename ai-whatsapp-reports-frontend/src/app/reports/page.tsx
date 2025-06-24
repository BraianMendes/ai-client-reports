"use client";
import { useState } from "react";
import { Card, CardHeader, Button, Tooltip } from "@heroui/react";
import { useReports, Report } from "@/hooks/useReports";
import { Download, FileText, ClipboardCopy } from "lucide-react";
import jsPDF from "jspdf";
import { ReactNode } from "react";

const PROMPT_TEMPLATES = [
    {
        id: "swot",
        name: "SWOT Analysis",
        template: `Generate a detailed SWOT analysis for the following client/business/challenge:\n\n[Describe the client or challenge here]`,
    },
    {
        id: "finance",
        name: "Financial Analysis",
        template: `Provide a detailed financial analysis regarding:\n\n[Describe the financial context, company, or scenario here]`,
    },
    {
        id: "market",
        name: "Market Analysis",
        template: `Produce a market analysis considering:\n\n[Describe the product, service, or industry of interest here]`,
    },
];

const OUTPUT_LANGUAGES = [
    { code: "en", name: "English" },
    { code: "pt", name: "Português" },
];

const OUTPUT_FORMATS = [
    { code: "paragraph", name: "Paragraph" },
    { code: "bullets", name: "Bullet Points" },
    { code: "table", name: "Table" },
];

function CardContent({
    children,
    className = "",
    ...props
}: {
    children: ReactNode;
    className?: string;
    [key: string]: unknown;
}) {
    return (
        <div className={`card-content ${className}`} {...props}>
            {children}
        </div>
    );
}

function exportMarkdown(filename: string, content: string) {
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

async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

function exportPDF(title: string, content: string) {
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

export default function ReportScreen() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [templateId, setTemplateId] = useState<string>(PROMPT_TEMPLATES[0].id);
    const [outputLanguage, setOutputLanguage] = useState<string>("en");
    const [outputFormat, setOutputFormat] = useState<string>("paragraph");
    const { reports, setReports } = useReports();

    const selectedTemplate = PROMPT_TEMPLATES.find((t) => t.id === templateId)!;

    async function handleSend() {
        setLoading(true);
        setOutput("");
        let prompt = "";
        if (selectedTemplate.template.includes("[Describe")) {
            prompt = selectedTemplate.template.replace(/\[Describe.*?\]/, input);
        } else {
            prompt = `${selectedTemplate.template}\n\n${input}`;
        }
        if (outputLanguage === "pt") {
            prompt += "\n\nPlease write the report in Portuguese (PT-BR).";
        } else {
            prompt += "\n\nPlease write the report in English.";
        }
        if (outputFormat === "bullets") {
            prompt += "\n\nFormat the output as bullet points.";
        } else if (outputFormat === "table") {
            prompt += "\n\nFormat the output as a markdown table.";
        } else {
            prompt += "\n\nFormat the output as regular text (paragraph).";
        }
        const res = await fetch("/api/analyze", {
            method: "POST",
            body: JSON.stringify({ message: prompt }),
            headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        const result = data.report || data.error || "Error generating report.";
        setOutput(result);
        setLoading(false);
        if (!data.error && input.trim()) {
            const newReport: Report = {
                id: Date.now().toString(),
                title:
                    input.trim().slice(0, 40) + (input.length > 40 ? "..." : ""),
                content: result,
                date: new Date().toISOString(),
            };
            setReports([newReport, ...reports]);
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center bg-[#111] pt-20 pb-10 px-4">
            <div className="w-full max-w-4xl space-y-10">
                <header>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                        AI Client Report
                    </h1>
                    <p className="text-neutral-400 text-base md:text-lg mb-8">
                        Generate a quick analysis and report about your client or business challenge.<br className="hidden md:block" />
                        Just describe your scenario below and click <span className="text-blue-500 font-semibold">Analyze</span>.
                    </p>
                </header>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        if (!input.trim() || loading) return;
                        handleSend();
                    }}
                >
                    <Card className="bg-[#181818] border border-neutral-800 shadow rounded-2xl">
                        <CardContent className="flex flex-col gap-4 p-6">
                            <label htmlFor="client" className="text-neutral-300 font-medium">
                                Client or Business Description
                            </label>
                            <textarea
                                id="client"
                                className="bg-black border border-neutral-800 text-white placeholder:text-neutral-500 min-h-[96px] md:min-h-[120px] rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition p-3 resize-none text-base"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={selectedTemplate.template.replace(/\[.*?\]/, "")}
                                disabled={loading}
                                autoComplete="off"
                            />
                            <div className="w-full flex flex-col md:flex-row gap-4 mt-2">
                                <div className="flex-1 flex flex-col">
                                    <label htmlFor="template" className="text-neutral-300 font-medium">
                                        Analysis Template
                                    </label>
                                    <select
                                        id="template"
                                        value={templateId}
                                        onChange={e => {
                                            setTemplateId(e.target.value);
                                            setInput("");
                                        }}
                                        className="bg-black border border-neutral-800 text-white rounded-xl p-3  focus:ring-blue-600 focus:border-blue-600"
                                        disabled={loading}
                                    >
                                        {PROMPT_TEMPLATES.map(tpl => (
                                            <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                                        ))}
                                    </select>
                                    <Button
                                        variant="bordered"
                                        className="w-fit px-3 py-1 mt-2 rounded-xl border border-blue-600 text-blue-400 text-xs"
                                        onClick={() =>
                                            setInput(
                                                selectedTemplate.template.match(/\[Describe.*?\]/)?.[0]?.replace(/[\[\]]/g, "") ||
                                                ""
                                            )
                                        }
                                        type="button"
                                        disabled={loading}
                                    >
                                        Insert template structure
                                    </Button>
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <label htmlFor="output-language" className="text-neutral-300 font-medium">
                                        Output Language
                                    </label>
                                    <select
                                        id="output-language"
                                        value={outputLanguage}
                                        onChange={e => setOutputLanguage(e.target.value)}
                                        className="bg-black border border-neutral-800 text-white rounded-xl p-3  focus:ring-blue-600 focus:border-blue-600"
                                        disabled={loading}
                                    >
                                        {OUTPUT_LANGUAGES.map(lang => (
                                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <label htmlFor="output-format" className="text-neutral-300 font-medium">
                                        Output Format
                                    </label>
                                    <select
                                        id="output-format"
                                        value={outputFormat}
                                        onChange={e => setOutputFormat(e.target.value)}
                                        className="bg-black border border-neutral-800 text-white rounded-xl p-3  focus:ring-blue-600 focus:border-blue-600"
                                        disabled={loading}
                                    >
                                        {OUTPUT_FORMATS.map(format => (
                                            <option key={format.code} value={format.code}>{format.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full mt-4 py-3 rounded-xl text-base font-semibold bg-blue-600 hover:bg-blue-700 transition text-white shadow-lg ring-2 ring-blue-500/20 hover:ring-blue-700/30 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                                disabled={loading || !input.trim()}
                            >
                                {loading ? "Analyzing..." : "Analyze"}
                            </Button>
                        </CardContent>
                    </Card>
                </form>
                <Card className="bg-[#181818] border border-neutral-800 shadow rounded-2xl">
                    <CardHeader>
                        <h2 className="text-white text-lg font-semibold">Report</h2>
                    </CardHeader>
                    <CardContent className="p-6">
                        <pre className="text-neutral-100 whitespace-pre-wrap break-words min-h-[120px]">
                            {output}
                        </pre>
                        {output && (
                            <div className="flex flex-wrap gap-3 mt-4">
                                <Tooltip content="Export as PDF">
                                    <Button
                                        variant="bordered"
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-600 text-blue-400 hover:bg-blue-600/10"
                                        onClick={() =>
                                            exportPDF(
                                                input.trim().slice(0, 40) || "Report",
                                                output
                                            )
                                        }
                                    >
                                        <Download size={18} /> PDF
                                    </Button>
                                </Tooltip>
                                <Tooltip content="Export as Markdown">
                                    <Button
                                        variant="bordered"
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-600 text-emerald-400 hover:bg-emerald-600/10"
                                        onClick={() =>
                                            exportMarkdown(
                                                (input.trim().slice(0, 40) || "report") + ".md",
                                                "# " + (input.trim().slice(0, 40) || "Report") + "\n\n" + output
                                            )
                                        }
                                    >
                                        <FileText size={18} /> Markdown
                                    </Button>
                                </Tooltip>
                                <Tooltip content={copied ? "Copied!" : "Copy to Clipboard"}>
                                    <Button
                                        variant="bordered"
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-violet-600 text-violet-400 hover:bg-violet-600/10"
                                        onClick={async () => {
                                            await copyToClipboard(output);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 1200);
                                        }}
                                    >
                                        <ClipboardCopy size={18} /> Copy
                                    </Button>
                                </Tooltip>
                            </div>
                        )}
                    </CardContent>
                </Card>
                {reports.length > 0 && (
                    <Card className="bg-[#181818] border border-neutral-800 shadow rounded-2xl mt-8">
                        <CardHeader>
                            <h3 className="text-white text-lg font-semibold">Report History</h3>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4 max-h-96 overflow-y-auto">
                            {reports.map((rep) => (
                                <div key={rep.id} className="border-b border-neutral-700 pb-3 mb-3 last:border-b-0 last:mb-0">
                                    <div className="text-neutral-300 text-sm mb-1">{new Date(rep.date).toLocaleString()}</div>
                                    <div className="text-white font-semibold">{rep.title}</div>
                                    <div className="text-neutral-400 text-xs mt-1">{rep.content.slice(0, 80)}{rep.content.length > 80 ? "..." : ""}</div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
