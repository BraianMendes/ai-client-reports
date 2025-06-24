"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github } from "lucide-react";
import { Button } from "@heroui/react";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/reports", label: "Reports" },
    { href: "/history", label: "History" },
    { href: "/chat", label: "AI Chat" },
    { href: "/about", label: "About" },
];

export default function NavBar() {
    const pathname = usePathname();

    return (
        <nav
            className="
        fixed top-0 left-0 z-50
        w-full
        bg-black/95
        shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]
        flex items-center justify-between
        px-4 py-2
        backdrop-blur-sm
      "
            style={{ minHeight: 48 }}
        >
            {/* Branding e navegação */}
            <div className="flex items-center gap-3">
                <Link
                    href="/"
                    className="text-white text-base font-semibold tracking-tight mr-3 select-none"
                    style={{ letterSpacing: "-0.03em" }}
                >
                    AI Client Report
                </Link>
                <div className="flex gap-0.5 md:gap-1">
                    {navLinks.map((link) => (
                        <Button
                            key={link.href}
                            variant={pathname === link.href ? "solid" : "ghost"}
                            className={`
                px-3 py-1 text-xs md:text-sm rounded-xl font-medium
                transition
                cursor-pointer
                ${pathname === link.href
                                    ? "bg-blue-600 text-white shadow hover:bg-blue-700"
                                    : "text-neutral-300 hover:text-white hover:bg-neutral-900/50"}
                `}
                            onClick={() => { window.location.href = link.href; }}
                        >
                            {link.label}
                        </Button>
                    ))}
                </div>
            </div>
            {/* Botão Github */}
            <Link
                href="https://github.com/BraianMendes"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Github"
                className="flex items-center"
            >
                <Button
                    variant="ghost"
                    className="flex items-center gap-1 text-neutral-300 px-3 py-1 rounded-xl hover:text-white hover:bg-neutral-800/70 transition shadow-none cursor-pointer"
                >
                    <Github className="w-4 h-4" strokeWidth={2} />
                    <span className="hidden md:inline">Github</span>
                </Button>
            </Link>
        </nav>
    );
}
