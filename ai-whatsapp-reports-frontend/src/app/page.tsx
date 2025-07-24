
"use client";
import Link from "next/link";
import { Button } from "@heroui/react";
import { FEATURES, APP_CONFIG } from "@/constants";
import Card from "@/components/Card";

export default function HomeScreen() {
	return (
		<main className="min-h-screen w-full bg-black flex flex-col items-center px-2 md:px-8">
			<div className="w-full max-w-4xl mt-28 flex flex-col items-center">
				<h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center tracking-tight">
					{APP_CONFIG.name}
				</h1>
				<p className="text-neutral-400 text-lg mb-12 text-center max-w-2xl">
					{APP_CONFIG.description}
				</p>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
					{FEATURES.map(({ title, description, icon, href, cta }) => (
						<Card
							key={title}
							title={title}
							icon={icon}
							hoverable
							clickable
							className="p-8"
						>
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
					))}
				</div>
			</div>
		</main>
	);
}
