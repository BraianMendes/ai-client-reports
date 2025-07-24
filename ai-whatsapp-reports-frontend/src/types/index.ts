// Global type definitions
export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  id?: string;
}

export interface Report {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  language: string;
  format: string;
  template?: string;
}

export interface RAGStats {
  totalDocuments: number;
  totalEmbeddings: number;
  storePath: string;
}

export interface SearchResult {
  content: string;
  similarity: number;
  metadata?: {
    title?: string;
    fileName?: string;
    category?: string;
  };
}

export interface Document {
  id: string;
  fileName: string;
  title: string;
  category: string;
  source: string;
  addedAt: string;
  type: string;
  isChunk: boolean;
  parentDocId?: string;
  contentPreview: string;
  contentLength: number;
}

export interface AddKnowledgeData {
  text: string;
  metadata: {
    title: string;
    category: string;
    source: string;
  };
}

export interface FeatureCard {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  cta: string;
}

export interface NavLink {
  href: string;
  label: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
}

export interface LanguageOption {
  code: string;
  name: string;
}

export interface FormatOption {
  code: string;
  name: string;
}

export interface NotificationProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}
