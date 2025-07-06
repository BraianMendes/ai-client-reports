const VectorStore = require('./vectorStore');
const DocumentProcessor = require('./documentProcessor');
const embeddingService = require('./embeddings');

class RAGService {
  constructor() {
    this.vectorStore = new VectorStore();
    this.documentProcessor = DocumentProcessor;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      console.log('🚀 Initializing RAG system...');
      
      // Initialize embedding service
      await embeddingService.initialize();
      
      // Initialize vector store
      await this.vectorStore.initialize();
      
      this.initialized = true;
      console.log('✅ RAG system initialized successfully!');
    } catch (error) {
      console.error('❌ Error initializing RAG:', error);
      throw error;
    }
  }

  async addDocument(filePath) {
    if (!this.initialized) await this.initialize();

    try {
      const processed = await this.documentProcessor.processFile(filePath);
      
      // Adiciona o documento principal
      const mainDocId = await this.vectorStore.addDocument(
        processed.content, 
        processed.metadata
      );

      // Adiciona chunks individualmente para melhor granularidade
      const chunkIds = [];
      for (let i = 0; i < processed.chunks.length; i++) {
        const chunk = processed.chunks[i];
        const chunkMetadata = {
          ...processed.metadata,
          isChunk: true,
          parentDocId: mainDocId,
          chunkIndex: i,
          chunkWordCount: chunk.wordCount
        };
        
        const chunkId = await this.vectorStore.addDocument(
          chunk.content,
          chunkMetadata
        );
        chunkIds.push(chunkId);
      }

      return {
        mainDocId,
        chunkIds,
        totalChunks: processed.chunks.length,
        metadata: processed.metadata
      };
    } catch (error) {
      console.error('❌ Erro ao adicionar documento ao RAG:', error);
      throw error;
    }
  }

  async addDirectory(dirPath) {
    if (!this.initialized) await this.initialize();

    try {
      const processedDocs = await this.documentProcessor.processDirectory(dirPath);
      const results = [];

      for (const doc of processedDocs) {
        try {
          const result = await this.addDocument(doc.metadata.filePath);
          results.push(result);
        } catch (error) {
          console.error(`❌ Erro ao adicionar ${doc.metadata.fileName}:`, error.message);
        }
      }

      return results;
    } catch (error) {
      console.error('❌ Erro ao processar diretório:', error);
      throw error;
    }
  }

  async search(query, options = {}) {
    if (!this.initialized) await this.initialize();

    const {
      topK = 5,
      threshold = 0.3,
      includeMetadata = true,
      filterBy = null
    } = options;

    try {
      const results = await this.vectorStore.search(query, topK, threshold);
      
      // Aplica filtros se especificados
      let filteredResults = results;
      if (filterBy) {
        filteredResults = results.filter(result => {
          return Object.entries(filterBy).every(([key, value]) => {
            return result.metadata[key] === value;
          });
        });
      }

      return filteredResults.map(result => ({
        content: result.content,
        similarity: result.similarity,
        metadata: includeMetadata ? result.metadata : undefined
      }));
    } catch (error) {
      console.error('❌ Erro na busca RAG:', error);
      throw error;
    }
  }

  async generateAnswer(question, options = {}) {
    if (!this.initialized) await this.initialize();

    try {
      const {
        topK = 3,
        threshold = 0.3,
        contextLength = 2000
      } = options;

      // Busca documentos relevantes
      const searchResults = await this.search(question, { topK, threshold });
      
      if (searchResults.length === 0) {
        return {
          answer: 'Não encontrei informações relevantes em minha base de conhecimento para responder essa pergunta.',
          sources: [],
          confidence: 0
        };
      }

      // Constrói contexto a partir dos resultados
      let context = '';
      const sources = [];
      let currentLength = 0;

      for (const result of searchResults) {
        const contentToAdd = `Fonte: ${result.metadata?.fileName || 'Documento'}\n${result.content}\n\n`;
        
        if (currentLength + contentToAdd.length <= contextLength) {
          context += contentToAdd;
          currentLength += contentToAdd.length;
          sources.push({
            fileName: result.metadata?.fileName,
            similarity: result.similarity,
            excerpt: result.content.substring(0, 200) + '...'
          });
        }
      }

      const avgConfidence = searchResults.reduce((sum, r) => sum + r.similarity, 0) / searchResults.length;

      return {
        context,
        sources,
        confidence: avgConfidence,
        totalResults: searchResults.length
      };
    } catch (error) {
      console.error('❌ Erro ao gerar resposta RAG:', error);
      throw error;
    }
  }

  async getStats() {
    if (!this.initialized) await this.initialize();
    return this.vectorStore.getStats();
  }

  async clearAll() {
    if (!this.initialized) await this.initialize();
    await this.vectorStore.clearAll();
  }

  async deleteDocument(docId) {
    if (!this.initialized) await this.initialize();
    await this.vectorStore.deleteDocument(docId);
  }

  // Método para listar todos os documentos
  async getAllDocuments() {
    if (!this.initialized) await this.initialize();
    return this.vectorStore.getAllDocuments();
  }

  // Método para adicionar conhecimento através de texto direto
  async addKnowledge(text, metadata = {}) {
    if (!this.initialized) await this.initialize();

    try {
      const enhancedMetadata = {
        source: 'manual',
        addedAt: new Date().toISOString(),
        type: 'knowledge',
        ...metadata
      };

      // Processa o texto como se fosse um documento
      const cleanText = this.documentProcessor.cleanContent(text);
      const chunks = this.documentProcessor.createChunks(cleanText, 1000, 100);

      // Adiciona texto principal
      const mainId = await this.vectorStore.addDocument(cleanText, enhancedMetadata);

      // Adiciona chunks se o texto for grande
      const chunkIds = [];
      if (chunks.length > 1) {
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const chunkMetadata = {
            ...enhancedMetadata,
            isChunk: true,
            parentDocId: mainId,
            chunkIndex: i
          };
          
          const chunkId = await this.vectorStore.addDocument(
            chunk.content,
            chunkMetadata
          );
          chunkIds.push(chunkId);
        }
      }

      return {
        mainId,
        chunkIds,
        totalChunks: chunks.length
      };
    } catch (error) {
      console.error('❌ Erro ao adicionar conhecimento:', error);
      throw error;
    }
  }
}

module.exports = new RAGService();
