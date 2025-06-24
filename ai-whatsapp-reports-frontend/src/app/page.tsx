// app/page.tsx
"use client";
import Link from "next/link";
import { Card, CardHeader, Button } from "@heroui/react";
import { FileText, History, MessageSquare } from "lucide-react";

const features = [
	{
		title: "AI Report",
		description:
			"Generate intelligent analyses and complete reports using generative AI.",
		icon: FileText,
		href: "/reports",
		cta: "Generate Report",
	},
	{
		title: "History",
		description:
			"Browse the history of generated reports, search and export previous analyses.",
		icon: History,
		href: "/history",
		cta: "View History",
	},
	{
		title: "AI Chat",
		description:
			"Chat directly with the AI for quick insights, questions, and brainstorming.",
		icon: MessageSquare,
		href: "/chat",
		cta: "Open Chat",
	},
];

export default function HomeScreen() {
	return (
		<main className="min-h-screen w-full bg-black flex flex-col items-center px-2 md:px-8">
			<div className="w-full max-w-4xl mt-28 flex flex-col items-center">
				<h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center tracking-tight">
					AI Client Report
				</h1>
				<p className="text-neutral-400 text-lg mb-12 text-center max-w-2xl">
					Intelligent platform for report generation, analysis history, and
					interactive AI chat. Minimalist, fast, and elegant.
				</p>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
					{features.map(
						({ title, description, icon: Icon, href, cta }) => (
							<Card
								key={title}
								className="flex flex-col items-center bg-neutral-900 border border-neutral-800 rounded-2xl shadow-md p-8 hover:border-blue-400/40 transition"
							>
								<CardHeader className="flex flex-col items-center mb-4">
									<Icon className="w-10 h-10 text-blue-400 mb-2" />
									<span className="text-xl font-semibold text-white">
										{title}
									</span>
								</CardHeader>
								<div className="flex-1 text-center text-neutral-300 mb-6">
									{description}
								</div>
								<Link href={href} className="w-full">
									<Button
										className="w-full flex items-center justify-center gap-2 rounded-xl py-2 bg-blue-600 hover:bg-blue-500 transition cursor-pointer"
										variant="solid"
									>
										{cta}
									</Button>
								</Link>
							</Card>
						)
					)}
				</div>
			</div>
		</main>
	);
}
