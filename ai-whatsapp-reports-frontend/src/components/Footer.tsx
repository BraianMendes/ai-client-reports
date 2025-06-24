import Link from "next/link";
import { Button } from "@heroui/react";

export default function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer className="w-full px-4 py-6 text-center bg-black border-t border-neutral-800 text-neutral-400 text-xs">
            Created by{" "}
            <Link
                href="https://github.com/BraianMendes"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white text-xs font-normal align-baseline"
            >
                @BraianMendes
            </Link>
            {" "}· {year}
        </footer>
    );
}
