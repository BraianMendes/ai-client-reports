const express = require('express');
const cors = require('cors');

// Importa apenas os serviços necessários para testar
const ragService = require('./utils/ragService');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3003; // Porta diferente para evitar conflitos

// 📚 ENDPOINTS RAG - Gestão de Conhecimento
app.post('/rag/add-knowledge', async (req, res) => {
  const { text, metadata } = req.body;
  if (!text) return res.status(400).json({ error: 'Texto é obrigatório' });
  
  try {
    const result = await ragService.addKnowledge(text, metadata);
    res.json({
      message: 'Conhecimento adicionado com sucesso',
      ...result
    });
  } catch (error) {
    console.error('❌ Erro ao adicionar conhecimento:', error);
    res.status(500).json({ error: 'Erro ao adicionar conhecimento' });
  }
});

app.post('/rag/search', async (req, res) => {
  const { query, topK = 5, threshold = 0.3 } = req.body;
  if (!query) return res.status(400).json({ error: 'Query é obrigatória' });
  
  try {
    const results = await ragService.search(query, { topK, threshold });
    res.json({
      query,
      results,
      totalFound: results.length
    });
  } catch (error) {
    console.error('❌ Erro na busca RAG:', error);
    res.status(500).json({ error: 'Erro na busca' });
  }
});

app.get('/rag/stats', async (req, res) => {
  try {
    const stats = await ragService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas RAG:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
});

// 📋 ENDPOINT PARA LISTAR TODOS OS DOCUMENTOS
app.get('/rag/documents', async (req, res) => {
  try {
    const documents = await ragService.getAllDocuments();
    res.json({
      documents,
      total: documents.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar documentos:', error);
    res.status(500).json({ error: 'Erro ao listar documentos' });
  }
});

// 🗑️ ENDPOINT PARA DELETAR DOCUMENTO INDIVIDUAL
app.delete('/rag/documents/:id', async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ error: 'ID do documento é obrigatório' });
  }

  try {
    await ragService.deleteDocument(id);
    res.json({ 
      message: 'Documento deletado com sucesso',
      deletedId: id
    });
  } catch (error) {
    console.error('❌ Erro ao deletar documento:', error);
    res.status(500).json({ error: 'Erro ao deletar documento' });
  }
});

// 🚀 Inicializa sistema RAG
ragService.initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Servidor teste RAG rodando em http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error('⚠️ Erro ao inicializar RAG:', error.message);
});
