"use client";
import { Card, CardHeader, Button } from "@heroui/react";
import { Github } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <main className="flex min-h-screen flex-col items-center bg-[#111] px-4 pb-12 pt-32">
            <Card className="w-full max-w-4xl bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-800 p-8">
                <CardHeader>
                    <div className="flex flex-col items-start">
                        <h1 className="text-3xl font-bold mb-2 text-white">About — AI Client Report</h1>
                        <p className="text-neutral-400 mt-2">
                            AI Client Report is a minimalist and elegant web platform for generating intelligent client and business reports using Generative AI, focused on accessibility, automation, and great user experience.
                        </p>
                    </div>
                </CardHeader>

                <div className="mt-6 space-y-5 text-neutral-300">
                    <section>
                        <h2 className="text-xl font-semibold mb-2 text-white">Technologies Adopted</h2>
                        <ul className="ml-5 list-disc space-y-1">
                            <li>
                                Next.js (App Router): for server components, fast SSR, and modular routing
                            </li>
                            <li>
                                React + TypeScript: for a robust, scalable and type-safe frontend
                            </li>
                            <li>
                                HeroUI (Tailwind-based UI kit): for rapid, beautiful, and accessible UI development
                            </li>
                            <li>
                                Tailwind CSS: for a modern, dark, minimalist visual style
                            </li>
                            <li>
                                Integration with free LLM APIs (Groq, OpenRouter, etc): to avoid cost and vendor lock-in
                            </li>
                            <li>
                                Baileys: for WhatsApp integration, enabling report generation directly from WhatsApp messages
                            </li>
                            <li>
                                Export to PDF/Markdown: for easy sharing and archiving of reports
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2 text-white">Main Features</h2>
                        <ul className="ml-5 list-disc space-y-1">
                            <li>
                                <span className="font-medium">AI-powered Report Generation</span>: Describe a client/business and get an instant intelligent report.
                            </li>
                            <li>
                                <span className="font-medium">Prompt Templates</span>: Choose pre-defined analysis types (SWOT, Financial, etc) to guide the AI.
                            </li>
                            <li>
                                <span className="font-medium">Report History & Search</span>: All generated reports are saved locally with easy keyword search.
                            </li>
                            <li>
                                <span className="font-medium">Export & Sharing</span>: Export reports as PDF, Markdown, or copy to clipboard.
                            </li>
                            <li>
                                <span className="font-medium">WhatsApp Integration</span>: Generate and receive reports via WhatsApp bot (experimental).
                            </li>
                            <li>
                                <span className="font-medium">Interactive AI Chat</span>: Chat with AI to get deeper insights and custom analysis.
                            </li>
                            <li>
                                <span className="font-medium">Dark, Responsive UI</span>: Modern, minimalist design. Perfect for mobile and desktop.
                            </li>
                            <li>
                                <span className="font-medium">Multi-language Output</span>: Choose between English and Portuguese for the generated reports.
                            </li>
                            <li>
                                <span className="font-medium">Output Customization</span>: Get results as bullet points, tables or plain text.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2 text-white">Why These Technologies?</h2>
                        <ul className="ml-5 list-disc space-y-1">
                            <li>
                                <span className="font-medium">Performance & Modularity</span>: Next.js and HeroUI allow fast, scalable, modular apps.
                            </li>
                            <li>
                                <span className="font-medium">Minimalist UX</span>: Tailwind and HeroUI ensure a clean, professional interface.
                            </li>
                            <li>
                                <span className="font-medium">AI Democratization</span>: Using free/open LLM APIs reduces costs and expands access.
                            </li>
                            <li>
                                <span className="font-medium">Automation & Communication</span>: WhatsApp integration brings reporting to where clients and teams already are.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2 text-white">Check the Code</h2>
                        <p>
                            Want to know how it works under the hood? The AI Client Report code is available on GitHub! Visit the repository to explore the features, understand the technologies used, or even suggest improvements.
                        </p>
                        <div className="flex gap-3 mt-4">
                            <Link
                                href="https://github.com/BraianMendes/ai-client-report"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <button
                                    className="flex gap-2 items-center rounded-xl shadow px-5 py-2 font-medium bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
                                >
                                    <Github className="w-5 h-5" />
                                    Repository
                                </button>
                            </Link>
                            <Link
                                href="https://github.com/BraianMendes"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <button
                                    className="flex gap-2 items-center rounded-xl border border-neutral-700 text-neutral-300 px-5 py-2 font-medium bg-transparent hover:bg-neutral-800 transition-colors"
                                >
                                    <Github className="w-5 h-5" />
                                    Author Profile
                                </button>
                            </Link>
                        </div>
                    </section>
                </div>
            </Card>
        </main>
    );
}
