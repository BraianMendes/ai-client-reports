import { FileText, History, MessageSquare } from "lucide-react";
import { FeatureCard, NavLink, PromptTemplate, LanguageOption, FormatOption } from "@/types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export const FEATURES: FeatureCard[] = [
  {
    title: "AI Report",
    description: "Generate intelligent analyses and complete reports using generative AI.",
    icon: FileText,
    href: "/reports",
    cta: "Generate Report",
  },
  {
    title: "History",
    description: "Browse the history of generated reports, search and export previous analyses.",
    icon: History,
    href: "/history",
    cta: "View History",
  },
  {
    title: "AI Chat",
    description: "Chat directly with the AI for quick insights, questions, and brainstorming.",
    icon: MessageSquare,
    href: "/chat",
    cta: "Open Chat",
  },
];

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/reports", label: "Reports" },
  { href: "/history", label: "History" },
  { href: "/chat", label: "AI Chat" },
  { href: "/rag", label: "RAG" },
  { href: "/about", label: "About" },
];

export const PROMPT_TEMPLATES: PromptTemplate[] = [
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

export const OUTPUT_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English" },
  { code: "pt", name: "Portuguese" },
];

export const OUTPUT_FORMATS: FormatOption[] = [
  { code: "paragraph", name: "Paragraph" },
  { code: "bullets", name: "Bullet Points" },
  { code: "table", name: "Table" },
];

export const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'text/html',
  'application/json'
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const DEFAULT_SEARCH_OPTIONS = {
  topK: 5,
  threshold: 0.2
};

export const NOTIFICATION_DURATION = 3000;

export const GITHUB_REPO_URL = "https://github.com/BraianMendes/ai-client-reports";

export const APP_CONFIG = {
  name: "AI Client Report",
  version: "0.1.0",
  description: "Intelligent platform for report generation, analysis history, and interactive AI chat.",
  author: "BraianMendes"
};
