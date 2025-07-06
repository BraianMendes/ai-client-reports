'use client'

import { useState, useEffect } from 'react'
import { Upload, Search, FileText, Brain, Trash2, BarChart3, MessageSquare, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useRAG } from '@/hooks/useRAG'

export default function RAGManagementPageSimple() {
  const {
    stats,
    searchResults,
    isLoading,
    loadStats,
    searchKnowledge,
    addKnowledge,
    uploadFiles,
    clearRAG
  } = useRAG()

  const [searchQuery, setSearchQuery] = useState('')
  const [knowledgeText, setKnowledgeText] = useState('')
  const [knowledgeTitle, setKnowledgeTitle] = useState('')
  const [knowledgeCategory, setKnowledgeCategory] = useState('')
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [isAddingKnowledge, setIsAddingKnowledge] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    loadStats().catch(() => {
      showNotification('error', 'Error loading RAG statistics')
    })
  }, [loadStats])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return

    setUploadProgress('Processando arquivos...')

    try {
      const result = await uploadFiles(files)
      showNotification('success', `${result.processedFiles} file(s) processed successfully!`)
      await loadStats()
    } catch {
      showNotification('error', 'Error uploading files')
    } finally {
      setUploadProgress(null)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    try {
      await searchKnowledge(searchQuery)
    } catch {
      showNotification('error', 'Error searching knowledge base')
    }
  }

  const handleAddKnowledge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!knowledgeText.trim()) return

    setIsAddingKnowledge(true)
    try {
      await addKnowledge({
        text: knowledgeText,
        metadata: {
          title: knowledgeTitle || 'Conhecimento sem título',
          category: knowledgeCategory || 'geral',
          source: 'frontend'
        }
      })

      showNotification('success', 'Knowledge added successfully!')
      setKnowledgeText('')
      setKnowledgeTitle('')
      setKnowledgeCategory('')
      await loadStats()
    } catch {
      showNotification('error', 'Error adding knowledge')
    } finally {
      setIsAddingKnowledge(false)
    }
  }

  const handleClearRAG = async () => {
    if (!confirm('Tem certeza que deseja limpar toda a base de conhecimento? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      await clearRAG()
      showNotification('success', 'Knowledge base cleared successfully!')
      await loadStats()
    } catch {
      showNotification('error', 'Error clearing knowledge base')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-2xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestão RAG</h1>
                <p className="text-gray-600">Sistema de Recuperação e Geração Aumentada</p>
              </div>
            </div>
            <button
              onClick={handleClearRAG}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Limpar Base
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            notification.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Documentos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Embeddings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEmbeddings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-2xl font-bold text-gray-900">Ativo</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Upload className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Upload de Documentos</h2>
            </div>

            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              {uploadProgress ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <p className="text-blue-600">{uploadProgress}</p>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Clique para selecionar arquivos
                  </p>
                  <p className="text-sm text-gray-500">
                    Suporte: PDF, DOCX, TXT, MD, HTML, JSON
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
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Adicionar Conhecimento</h2>
            </div>

            <form onSubmit={handleAddKnowledge} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={knowledgeTitle}
                  onChange={(e) => setKnowledgeTitle(e.target.value)}
                  placeholder="Ex: Metodologia Scrum"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <input
                  type="text"
                  value={knowledgeCategory}
                  onChange={(e) => setKnowledgeCategory(e.target.value)}
                  placeholder="Ex: metodologia, financeiro, marketing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conhecimento
                </label>
                <textarea
                  value={knowledgeText}
                  onChange={(e) => setKnowledgeText(e.target.value)}
                  placeholder="Digite o conhecimento que deseja adicionar à base..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                Adicionar à Base
              </button>
            </form>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <div className="flex items-center gap-3 mb-6">
            <Search className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Buscar na Base de Conhecimento</h2>
          </div>

          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: Como fazer análise SWOT?"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Buscar
              </button>
            </div>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">
                Resultados encontrados ({searchResults.length})
              </h3>
              {searchResults.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {result.metadata?.title && (
                        <span className="font-medium text-gray-900">
                          {result.metadata.title}
                        </span>
                      )}
                      {result.metadata?.category && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {result.metadata.category}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-purple-600">
                      {(result.similarity * 100).toFixed(1)}% similar
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {result.content.length > 300 
                      ? result.content.substring(0, 300) + '...' 
                      : result.content
                    }
                  </p>
                </div>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum resultado encontrado para &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
