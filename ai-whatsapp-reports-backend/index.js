require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { startBot } = require('./bot');
const conversationContext = require('./utils/conversationContext');
const ragService = require('./utils/ragService');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Mantém o nome original com timestamp para evitar conflitos
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}_${timestamp}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Extensões permitidas
    const allowedExtensions = ['.pdf', '.docx', '.txt', '.md', '.html', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}`), false);
    }
  }
});

const app = express();
app.use(express.json());
app.use(cors());

// Serve arquivos estáticos da pasta public
app.use('/public', express.static('public'));

const PORT = process.env.PORT || 3001;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = process.env.GROQ_URL || 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama3-70b-8192';

app.post('/analyze', async (req, res) => {
  const { message, userId } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  const sessionUserId = userId || 'web-user';
  
  if (message === 'MENSAGEM_MIDIA_DETECTADA') {
    return res.status(422).json({ 
      error: 'Media not supported',
      message: 'Our current POC only analyzes text messages. Please describe your request in text.'
    });
  }
  
  const messageType = conversationContext.detectMessageType(message);
  if (messageType === 'empty') {
    return res.status(400).json({ 
      error: 'Empty message',
      message: 'Please send a message with valid content for analysis.'
    });
  }
  
  const session = conversationContext.addMessage(sessionUserId, 'user', message);
  if (!session) {
    return res.status(400).json({ 
      error: 'Invalid message content',
      message: 'Could not process your message. Please check if it contains valid text.'
    });
  }
  
  const contextPrompt = conversationContext.buildContextPrompt(sessionUserId, message);

  let ragContext = '';
  try {
    const ragResults = await ragService.generateAnswer(message, {
      topK: 3,
      threshold: 0.4,
      contextLength: 1500
    });
    
    if (ragResults.sources.length > 0) {
      ragContext = `\n**KNOWLEDGE FROM DATABASE:**\n${ragResults.context}\n`;
      console.log(`📚 RAG found ${ragResults.sources.length} relevant sources (confidence: ${(ragResults.confidence * 100).toFixed(1)}%)`);
    }
  } catch (error) {
    console.warn('⚠️ RAG error, continuing without additional context:', error.message);
  }

  const prompt = `
You are a helpful commercial assistant. Your role is to provide clear, accurate, and useful responses to any questions or requests from users.

${contextPrompt}${ragContext}

**YOUR CAPABILITIES:**
- Answer questions on any topic with accuracy and clarity
- Provide business insights and analysis when requested
- Help with general information and explanations
- Assist with problem-solving and decision-making
- Offer practical advice and recommendations

**RESPONSE GUIDELINES:**
- Be helpful, professional, and friendly
- Provide clear and well-structured answers
- Use examples when they help clarify your response
- If you need more information to provide a better answer, ask clarifying questions
- Reference previous conversation context when relevant
- Adapt your language and tone to match the user's needs
- If the question is about business analysis, provide structured insights
- For general questions, give comprehensive but concise answers

**IMPORTANT:**
- Answer in the same language the user is communicating in
- Be honest if you don't know something or if information is incomplete
- Focus on being helpful rather than trying to fit responses into specific formats
- Use the knowledge base context when available to enhance your responses

*Current user message:*
${message}
`;

  try {
    const completion = await axios.post(
      GROQ_URL,
      {
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
        temperature: 0.4,
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const report = completion.data.choices[0].message.content;

    const messageType = report.includes('RELATÓRIO') ? 'report' : 'consultation';
    conversationContext.addMessage(sessionUserId, 'assistant', report, messageType);

    res.json({
      report,
      sessionStats: conversationContext.getSessionStats(sessionUserId)
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

app.get('/session/:userId', (req, res) => {
  const { userId } = req.params;
  const stats = conversationContext.getSessionStats(userId);
  res.json(stats);
});

app.delete('/session/:userId', (req, res) => {
  const { userId } = req.params;
  conversationContext.resetSession(userId);
  res.json({ message: 'Session reset successfully' });
});

app.get('/conversation/:userId', (req, res) => {
  const { userId } = req.params;
  const session = conversationContext.getSession(userId);
  res.json({
    messages: session.messages.slice(-10),
    context: session.context
  });
});

app.post('/admin/allow-user', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'User ID required' });
  
  conversationContext.addAllowedUser(userId);
  res.json({ message: `User ${userId} added to allowed list` });
});

app.delete('/admin/allow-user/:userId', (req, res) => {
  const { userId } = req.params;
  conversationContext.removeAllowedUser(userId);
  res.json({ message: `User ${userId} removed from allowed list` });
});

// 📚 RAG ENDPOINTS - Knowledge Management
app.post('/rag/add-knowledge', async (req, res) => {
  const { text, metadata } = req.body;
  if (!text) return res.status(400).json({ error: 'Texto é obrigatório' });
  
  try {
    const result = await ragService.addKnowledge(text, metadata);
    res.json({
      message: 'Knowledge added successfully',
      ...result
    });
  } catch (error) {
    console.error('❌ Error adding knowledge:', error);
    res.status(500).json({ error: 'Error adding knowledge' });
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

app.delete('/rag/clear', async (req, res) => {
  try {
    await ragService.clearAll();
    res.json({ message: 'Knowledge base cleared successfully' });
  } catch (error) {
    console.error('❌ Erro ao limpar base RAG:', error);
    res.status(500).json({ error: 'Error clearing knowledge base' });
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

// 📁 ENDPOINT UPLOAD DE ARQUIVOS PARA RAG
app.post('/rag/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    console.log(`📄 Processing uploaded file: ${req.file.originalname}`);
    
    const result = await ragService.addDocument(req.file.path);
    
    // Remove o arquivo temporário após processamento
    fs.unlinkSync(req.file.path);
    
    res.json({
      message: 'File processed and added to knowledge base',
      fileName: req.file.originalname,
      ...result
    });
    
  } catch (error) {
    console.error('❌ Erro ao processar upload:', error);
    
    // Remove arquivo em caso de erro
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Erro ao processar arquivo',
      details: error.message 
    });
  }
});

// 📁 ENDPOINT UPLOAD MÚLTIPLO
app.post('/rag/upload-multiple', upload.array('documents', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    console.log(`📄 Processing ${req.files.length} files...`);
    
    const results = [];
    const errors = [];
    
    for (const file of req.files) {
      try {
        const result = await ragService.addDocument(file.path);
        results.push({
          fileName: file.originalname,
          ...result
        });
        
        // Remove arquivo após processamento
        fs.unlinkSync(file.path);
        
      } catch (error) {
        errors.push({
          fileName: file.originalname,
          error: error.message
        });
        
        // Remove arquivo em caso de erro
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }
    
    res.json({
      message: `${results.length} arquivos processados com sucesso`,
      processedFiles: results.length,
      totalFiles: req.files.length,
      results,
      errors
    });
    
  } catch (error) {
    console.error('❌ Erro no upload múltiplo:', error);
    
    // Limpa arquivos em caso de erro geral
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({ 
      error: 'Erro ao processar arquivos',
      details: error.message 
    });
  }
});

// 🎯 ENDPOINT DASHBOARD RAG
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

startBot();

// 🚀 Inicializa sistema RAG
ragService.initialize().catch(error => {
  console.error('⚠️ Erro ao inicializar RAG, sistema funcionará sem RAG:', error.message);
});

app.listen(PORT, () => {
  console.log('Backend running on http://localhost:' + PORT);
});
