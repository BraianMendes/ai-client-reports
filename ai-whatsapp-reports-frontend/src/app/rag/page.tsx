'use client'

import { useState, useEffect } from 'react'
import { Upload, Search, FileText, Brain, Trash2, Download, BarChart3, MessageSquare, Loader2, CheckCircle, XCircle } from 'lucide-react'
import RAGExplorer from '../../components/RAGExplorer'

interface RAGStats {
  totalDocuments: number
  totalEmbeddings: number
  storePath: string
}

interface SearchResult {
  content: string
  similarity: number
  metadata?: {
    title?: string
    fileName?: string
    category?: string
  }
}

export default function RAGManagementPage() {
  const [stats, setStats] = useState<RAGStats | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [knowledgeText, setKnowledgeText] = useState('')
  const [knowledgeTitle, setKnowledgeTitle] = useState('')
  const [knowledgeCategory, setKnowledgeCategory] = useState('')
  const [isAddingKnowledge, setIsAddingKnowledge] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Use local API routes instead of direct backend access (fixes HTTPS/HTTP mixed content)
  const API_BASE = '/api'

  // Load statistics when component mounts
  useEffect(() => {
    const loadStatsData = async () => {
      try {
        const response = await fetch(`${API_BASE}/rag/stats`)
        const data = await response.json()
        setStats(data)
      } catch {
        showNotification('error', 'Error loading RAG statistics')
      }
    }
    loadStatsData()
  }, [API_BASE])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/rag/stats`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error loading statistics:', error)
      showNotification('error', 'Error loading RAG statistics')
    }
  }

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return

    setUploadProgress('Processing files...')

    const formData = new FormData()
    Array.from(files).forEach(file => {
      formData.append('documents', file)
    })

    try {
      const response = await fetch(`${API_BASE}/rag/upload-multiple`, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        showNotification('success', `${result.processedFiles} file(s) processed successfully!`)
        loadStats()
      } else {
        showNotification('error', result.error || 'Error uploading files')
      }
    } catch {
      showNotification('error', 'Error uploading files')
    } finally {
      setUploadProgress(null)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(`${API_BASE}/rag/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery,
          topK: 5,
          threshold: 0.2
        })
      })

      const result = await response.json()
      setSearchResults(result.results || [])
    } catch {
      showNotification('error', 'Error searching knowledge base')
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!knowledgeText.trim()) return

    setIsAddingKnowledge(true)
    try {
      const response = await fetch(`${API_BASE}/rag/add-knowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: knowledgeText,
          metadata: {
            title: knowledgeTitle || 'Untitled knowledge',
            category: knowledgeCategory || 'general',
            source: 'frontend'
          }
        })
      })

      const result = await response.json()

      if (response.ok) {
        showNotification('success', 'Knowledge added successfully!')
        setKnowledgeText('')
        setKnowledgeTitle('')
        setKnowledgeCategory('')
        loadStats()
      } else {
        showNotification('error', result.error || 'Error adding knowledge')
      }
    } catch {
      showNotification('error', 'Error adding knowledge')
    } finally {
      setIsAddingKnowledge(false)
    }
  }

  const handleClearRAG = async () => {
    if (!confirm('Are you sure you want to clear the entire knowledge base? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE}/rag/clear`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showNotification('success', 'Knowledge base cleared successfully!')
        setSearchResults([])
        loadStats()
      } else {
        showNotification('error', 'Error clearing knowledge base')
      }
    } catch {
      showNotification('error', 'Error clearing knowledge base')
    }
  }

  return (
    <div className="min-h-screen bg-[#101010] p-4">
      <div className="max-w-7xl mx-auto mt-14">
        {/* Header */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-2xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">RAG Management</h1>
                <p className="text-neutral-400">Retrieval-Augmented Generation System</p>
              </div>
            </div>
            <button
              onClick={handleClearRAG}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear Database
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            notification.type === 'success' 
              ? 'bg-green-900/50 text-green-300 border border-green-800' 
              : 'bg-red-900/50 text-red-300 border border-red-800'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            {notification.message}
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-900/50 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Documents</p>
                  <p className="text-2xl font-bold text-white">{stats.totalDocuments}</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-900/50 p-3 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Embeddings</p>
                  <p className="text-2xl font-bold text-white">{stats.totalEmbeddings}</p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-900/50 p-3 rounded-lg">
                  <Download className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Storage</p>
                  <p className="text-2xl font-bold text-white">Local</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Upload className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Document Upload</h2>
            </div>

            <div
              className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center hover:border-blue-400/40 transition-colors cursor-pointer bg-neutral-800/50"
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              {uploadProgress ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                  <p className="text-blue-400">{uploadProgress}</p>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-white mb-2">
                    Click to select files
                  </p>
                  <p className="text-sm text-neutral-400">
                    Supported: PDF, DOCX, TXT, MD, HTML, JSON
                  </p>
                </>
              )}
            </div>

            <input
              id="fileInput"
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.md,.html,.json"
              className="hidden"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            />
          </div>

          {/* Add Knowledge Section */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Add Knowledge</h2>
            </div>

            <form onSubmit={handleAddKnowledge} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={knowledgeTitle}
                  onChange={(e) => setKnowledgeTitle(e.target.value)}
                  placeholder="Ex: Scrum Methodology"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-neutral-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={knowledgeCategory}
                  onChange={(e) => setKnowledgeCategory(e.target.value)}
                  placeholder="Ex: methodology, financial, marketing"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-neutral-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Knowledge
                </label>
                <textarea
                  value={knowledgeText}
                  onChange={(e) => setKnowledgeText(e.target.value)}
                  placeholder="Enter the knowledge you want to add to the database..."
                  rows={6}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-neutral-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isAddingKnowledge}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isAddingKnowledge ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
                Add to Database
              </button>
            </form>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg p-6 mt-8">
          <div className="flex items-center gap-3 mb-6">
            <Search className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Search Knowledge Base</h2>
          </div>

          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: How to do SWOT analysis?"
                className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-neutral-400"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Search
              </button>
            </div>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-white">
                Results found ({searchResults.length})
              </h3>
              {searchResults.map((result, index) => (
                <div key={index} className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {result.metadata?.title && (
                        <span className="font-medium text-white">
                          {result.metadata.title}
                        </span>
                      )}
                      {result.metadata?.category && (
                        <span className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded-full border border-blue-800">
                          {result.metadata.category}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-purple-400">
                      {(result.similarity * 100).toFixed(1)}% similar
                    </span>
                  </div>
                  <p className="text-neutral-300 text-sm leading-relaxed">
                    {result.content.length > 300 
                      ? result.content.substring(0, 300) + '...' 
                      : result.content
                    }
                  </p>
                </div>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !isSearching && (
            <div className="text-center py-8 text-neutral-400">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No results found for &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </div>

        {/* RAG Explorer Section */}
        <div className="mt-8">
          <RAGExplorer 
            apiBase={API_BASE} 
            onDocumentDeleted={loadStats}
          />
        </div>
      </div>
    </div>
  )
}
