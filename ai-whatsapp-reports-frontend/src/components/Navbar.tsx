"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@heroui/react";
import { Github } from "lucide-react";
import { NAV_LINKS, GITHUB_REPO_URL, APP_CONFIG } from "@/constants";

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
            <div className="flex items-center gap-3">
                <Link
                    href="/"
                    className="text-white text-base font-semibold tracking-tight mr-3 select-none"
                    style={{ letterSpacing: "-0.03em" }}
                >
                    {APP_CONFIG.name}
                </Link>
                <div className="flex gap-0.5 md:gap-1">
                    {NAV_LINKS.map((link) => (
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
            <div className="flex items-center">
                <Button
                    as={Link}
                    href={GITHUB_REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="bordered"
                    className="
                        flex items-center gap-2
                        text-white border-neutral-600 
                        hover:border-blue-400 hover:text-blue-400 hover:bg-blue-400/10
                        transition-all duration-200
                        px-4 py-2 
                        rounded-full
                        text-sm font-medium
                        backdrop-blur-sm
                    "
                >
                    <Github className="w-4 h-4" />
                    GitHub
                </Button>
            </div>
        </nav>
    );
}
