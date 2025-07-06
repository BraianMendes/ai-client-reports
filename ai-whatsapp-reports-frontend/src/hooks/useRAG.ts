import { useState, useCallback } from 'react'

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

interface AddKnowledgeData {
  text: string
  metadata: {
    title: string
    category: string
    source: string
  }
}

export const useRAG = () => {
  const [stats, setStats] = useState<RAGStats | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/rag/stats`)
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
      return data
    } catch (error) {
      console.error('Error loading RAG stats:', error)
      throw error
    }
  }, [API_BASE])

  const searchKnowledge = useCallback(async (query: string, options?: { topK?: number, threshold?: number }) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE}/rag/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          topK: options?.topK || 5,
          threshold: options?.threshold || 0.2
        })
      })
      
      if (!response.ok) throw new Error('Search failed')
      
      const result = await response.json()
      setSearchResults(result.results || [])
      return result.results || []
    } catch (error) {
      console.error('Error searching knowledge:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [API_BASE])

  const addKnowledge = useCallback(async (data: AddKnowledgeData) => {
    try {
      const response = await fetch(`${API_BASE}/rag/add-knowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) throw new Error('Failed to add knowledge')
      
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error adding knowledge:', error)
      throw error
    }
  }, [API_BASE])

  const uploadFiles = useCallback(async (files: FileList) => {
    const formData = new FormData()
    Array.from(files).forEach(file => {
      formData.append('documents', file)
    })

    try {
      const response = await fetch(`${API_BASE}/rag/upload-multiple`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) throw new Error('Upload failed')
      
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error uploading files:', error)
      throw error
    }
  }, [API_BASE])

  const clearRAG = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/rag/clear`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to clear RAG')
      
      setStats(null)
      setSearchResults([])
      return true
    } catch (error) {
      console.error('Error clearing RAG:', error)
      throw error
    }
  }, [API_BASE])

  return {
    stats,
    searchResults,
    isLoading,
    loadStats,
    searchKnowledge,
    addKnowledge,
    uploadFiles,
    clearRAG
  }
}
