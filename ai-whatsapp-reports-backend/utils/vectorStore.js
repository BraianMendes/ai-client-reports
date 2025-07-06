const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const embeddingService = require('./embeddings');

class VectorStore {
  constructor(storePath = './data/vector_store') {
    this.storePath = storePath;
    this.documentsFile = path.join(storePath, 'documents.json');
    this.embeddingsFile = path.join(storePath, 'embeddings.json');
    this.metadataFile = path.join(storePath, 'metadata.json');
    this.documents = [];
    this.embeddings = [];
    this.metadata = {};
  }

  async initialize() {
    try {
      // Cria diretório se não existir
      await fs.mkdir(this.storePath, { recursive: true });
      
      // Carrega dados existentes
      await this.loadFromDisk();
      
      console.log(`✅ Vector Store initialized with ${this.documents.length} documents`);
    } catch (error) {
      console.error('❌ Erro ao inicializar Vector Store:', error);
      throw error;
    }
  }

  async loadFromDisk() {
    try {
      // Carrega documentos
      if (await this.fileExists(this.documentsFile)) {
        const documentsData = await fs.readFile(this.documentsFile, 'utf-8');
        this.documents = JSON.parse(documentsData);
      }

      // Carrega embeddings
      if (await this.fileExists(this.embeddingsFile)) {
        const embeddingsData = await fs.readFile(this.embeddingsFile, 'utf-8');
        this.embeddings = JSON.parse(embeddingsData);
      }

      // Carrega metadata
      if (await this.fileExists(this.metadataFile)) {
        const metadataData = await fs.readFile(this.metadataFile, 'utf-8');
        this.metadata = JSON.parse(metadataData);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar dados do disco, iniciando com dados vazios:', error.message);
    }
  }

  async saveToDisk() {
    try {
      await fs.writeFile(this.documentsFile, JSON.stringify(this.documents, null, 2));
      await fs.writeFile(this.embeddingsFile, JSON.stringify(this.embeddings, null, 2));
      await fs.writeFile(this.metadataFile, JSON.stringify(this.metadata, null, 2));
    } catch (error) {
      console.error('❌ Erro ao salvar dados no disco:', error);
      throw error;
    }
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  generateId(content) {
    return crypto.createHash('md5').update(content).digest('hex');
  }

  async addDocument(content, metadata = {}) {
    try {
      const id = this.generateId(content);
      
      // Verifica se o documento já existe
      const existingIndex = this.documents.findIndex(doc => doc.id === id);
      if (existingIndex !== -1) {
        console.log(`📄 Document already exists: ${metadata.fileName || id}`);
        return id;
      }

      console.log(`➕ Adding document: ${metadata.fileName || id}`);
      
      // Gera embedding
      const embedding = await embeddingService.generateEmbedding(content);
      
      // Adiciona documento
      const document = {
        id,
        content,
        addedAt: new Date().toISOString(),
        ...metadata
      };
      
      this.documents.push(document);
      this.embeddings.push({ id, embedding });
      
      // Salva no disco
      await this.saveToDisk();
      
      console.log(`✅ Document added successfully: ${id}`);
      return id;
    } catch (error) {
      console.error('❌ Erro ao adicionar documento:', error);
      throw error;
    }
  }

  async addDocuments(documents) {
    const ids = [];
    for (const doc of documents) {
      const id = await this.addDocument(doc.content, doc.metadata);
      ids.push(id);
    }
    return ids;
  }

  async search(query, topK = 5, threshold = 0.3) {
    try {
      if (this.documents.length === 0) {
        return [];
      }

      console.log(`🔍 Searching for: "${query}" (top ${topK})`);
      
      // Gera embedding da query
      const queryEmbedding = await embeddingService.generateEmbedding(query);
      
      // Calcula similaridades
      const similarities = this.embeddings.map((item, index) => ({
        id: item.id,
        similarity: embeddingService.cosineSimilarity(queryEmbedding, item.embedding),
        document: this.documents[index]
      }));
      
      // Filtra por threshold e ordena por similaridade
      const results = similarities
        .filter(item => item.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);
      
      console.log(`📊 Found ${results.length} relevant results`);
      
      return results.map(result => ({
        content: result.document.content,
        metadata: result.document,
        similarity: result.similarity
      }));
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      throw error;
    }
  }

  async deleteDocument(id) {
    try {
      const docIndex = this.documents.findIndex(doc => doc.id === id);
      const embIndex = this.embeddings.findIndex(emb => emb.id === id);
      
      if (docIndex !== -1) {
        this.documents.splice(docIndex, 1);
      }
      
      if (embIndex !== -1) {
        this.embeddings.splice(embIndex, 1);
      }
      
      await this.saveToDisk();
      console.log(`🗑️ Document removed: ${id}`);
    } catch (error) {
      console.error('❌ Erro ao remover documento:', error);
      throw error;
    }
  }

  async clearAll() {
    this.documents = [];
    this.embeddings = [];
    this.metadata = {};
    await this.saveToDisk();
    console.log('🧹 Vector Store completely cleared');
  }

  getStats() {
    return {
      totalDocuments: this.documents.length,
      totalEmbeddings: this.embeddings.length,
      storePath: this.storePath,
      lastUpdated: this.metadata.lastUpdated || null
    };
  }

  // Método para listar todos os documentos
  getAllDocuments() {
    return this.documents.map(doc => ({
      id: doc.id,
      fileName: doc.fileName || 'Sem nome',
      title: doc.title || doc.fileName || 'Documento sem título',
      category: doc.category || 'geral',
      source: doc.source || 'upload',
      addedAt: doc.addedAt,
      type: doc.type || 'document',
      isChunk: doc.isChunk || false,
      parentDocId: doc.parentDocId,
      contentPreview: doc.content ? doc.content.substring(0, 200) + '...' : '',
      contentLength: doc.content ? doc.content.length : 0
    }));
  }

  async exportData() {
    return {
      documents: this.documents,
      embeddings: this.embeddings,
      metadata: this.metadata,
      exportedAt: new Date().toISOString()
    };
  }

  async importData(data) {
    this.documents = data.documents || [];
    this.embeddings = data.embeddings || [];
    this.metadata = data.metadata || {};
    await this.saveToDisk();
    console.log('📥 Data imported successfully');
  }
}

module.exports = VectorStore;
