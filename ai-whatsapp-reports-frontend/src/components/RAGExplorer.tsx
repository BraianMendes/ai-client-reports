'use client'

import { useState, useEffect } from 'react'
import { Folder, File, Trash2, Calendar, Eye, FileText, Hash, Tag, AlertCircle, RefreshCw } from 'lucide-react'

interface Document {
  id: string
  fileName: string
  title: string
  category: string
  source: string
  addedAt: string
  type: string
  isChunk: boolean
  parentDocId?: string
  contentPreview: string
  contentLength: number
}

interface RAGExplorerProps {
  apiBase: string
  onDocumentDeleted?: () => void
}

export default function RAGExplorer({ apiBase, onDocumentDeleted }: RAGExplorerProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'documents' | 'chunks'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${apiBase}/rag/documents`)
      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('Erro ao carregar documentos:', error)
      showNotification('error', 'Error loading documents')
    } finally {
      setLoading(false)
    }
  }

  const deleteDocument = async (docId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return

    setDeletingId(docId)
    try {
      const response = await fetch(`${apiBase}/rag/documents/${docId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadDocuments()
        showNotification('success', 'Document deleted successfully!')
        onDocumentDeleted?.()
      } else {
        const error = await response.json()
        showNotification('error', error.error || 'Error deleting document')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      showNotification('error', 'Error deleting document')
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [apiBase]) // eslint-disable-line react-hooks/exhaustive-deps

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'documents' && doc.isChunk) return false
    if (filter === 'chunks' && !doc.isChunk) return false
    if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false
    return true
  })

  const categories = [...new Set(documents.map(doc => doc.category))].filter(Boolean)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (doc: Document) => {
    if (doc.isChunk) {
      return <Hash className="w-4 h-4 text-orange-500" />
    }
    return <FileText className="w-4 h-4 text-blue-500" />
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Folder className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">RAG Explorer</h2>
        </div>
        <button
          onClick={loadDocuments}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          notification.type === 'success' 
            ? 'bg-green-900/50 text-green-300 border border-green-800' 
            : 'bg-red-900/50 text-red-300 border border-red-800'
        }`}>
          {notification.type === 'success' ? (
            <div className="w-2 h-2 bg-green-400 rounded-full" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          {notification.message}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filter === 'all'
                ? 'bg-blue-900/50 text-blue-300 border border-blue-800'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 border border-neutral-700'
            }`}
          >
            All ({documents.length})
          </button>
          <button
            onClick={() => setFilter('documents')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filter === 'documents'
                ? 'bg-blue-900/50 text-blue-300 border border-blue-800'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 border border-neutral-700'
            }`}
          >
            Documents ({documents.filter(d => !d.isChunk).length})
          </button>
          <button
            onClick={() => setFilter('chunks')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filter === 'chunks'
                ? 'bg-blue-900/50 text-blue-300 border border-blue-800'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 border border-neutral-700'
            }`}
          >
            Chunks ({documents.filter(d => d.isChunk).length})
          </button>
        </div>

        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
          >
            <option value="all">All categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        )}
      </div>

      {/* Document List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-neutral-400" />
          <span className="ml-2 text-neutral-400">Loading documents...</span>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No documents found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="border border-neutral-700 rounded-lg p-4 hover:border-neutral-600 transition-colors bg-neutral-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(doc)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white truncate">
                        {doc.title}
                      </span>
                      {doc.isChunk && (
                        <span className="px-2 py-0.5 bg-orange-900/50 text-orange-300 text-xs rounded-full border border-orange-800">
                          Chunk
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-blue-900/50 text-blue-300 text-xs rounded-full border border-blue-800">
                        {doc.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(doc.addedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <File className="w-3 h-3" />
                        {doc.contentLength.toLocaleString()} chars
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {doc.source}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                    className="p-2 text-neutral-400 hover:text-neutral-200 transition-colors"
                    title="View content"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteDocument(doc.id, doc.title)}
                    disabled={deletingId === doc.id}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                    title="Delete document"
                  >
                    {deletingId === doc.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedDoc === doc.id && (
                <div className="mt-4 pt-4 border-t border-neutral-700">
                  <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-700">
                    <h4 className="text-sm font-medium text-neutral-300 mb-2">Content Preview:</h4>
                    <p className="text-sm text-neutral-400 leading-relaxed">
                      {doc.contentPreview}
                    </p>
                    {doc.parentDocId && (
                      <div className="mt-2 text-xs text-neutral-500">
                        <span className="font-medium">Parent document:</span> {doc.parentDocId}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
