import { useState, useCallback } from 'react';
import { RAGStats, SearchResult, AddKnowledgeData } from '@/types';
import { API_BASE_URL, DEFAULT_SEARCH_OPTIONS } from '@/constants';
import { useApi } from './useApi';

export const useRAG = () => {
  const [stats, setStats] = useState<RAGStats | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { execute } = useApi<unknown>();

  const loadStats = useCallback(async () => {
    try {
      const data = await execute('/rag/stats');
      setStats(data as RAGStats);
      return data;
    } catch (error) {
      console.error('Error loading RAG stats:', error);
      throw error;
    }
  }, [execute]);

  const searchKnowledge = useCallback(async (
    query: string, 
    options?: { topK?: number; threshold?: number }
  ) => {
    setIsLoading(true);
    try {
      const result = await execute('/rag/search', {
        method: 'POST',
        body: JSON.stringify({
          query,
          topK: options?.topK || DEFAULT_SEARCH_OPTIONS.topK,
          threshold: options?.threshold || DEFAULT_SEARCH_OPTIONS.threshold
        })
      });
      
      const results = (result as { results?: SearchResult[] })?.results || [];
      setSearchResults(results);
      return results;
    } catch (error) {
      console.error('Error searching knowledge:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [execute]);

  const addKnowledge = useCallback(async (data: AddKnowledgeData) => {
    try {
      const result = await execute('/rag/add-knowledge', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      return result;
    } catch (error) {
      console.error('Error adding knowledge:', error);
      throw error;
    }
  }, [execute]);

  const uploadFiles = useCallback(async (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('documents', file);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/rag/upload-documents`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  }, []);

  const clearKnowledge = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rag/clear`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Clear failed');
      
      setStats(null);
      setSearchResults([]);
      
      return await response.json();
    } catch (error) {
      console.error('Error clearing knowledge:', error);
      throw error;
    }
  }, []);

  return {
    stats,
    searchResults,
    isLoading,
    loadStats,
    searchKnowledge,
    addKnowledge,
    uploadFiles,
    clearKnowledge
  };
};
