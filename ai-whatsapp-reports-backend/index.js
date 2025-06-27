require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { startBot } = require('./bot');
const conversationContext = require('./utils/conversationContext');

const app = express();
app.use(express.json());
app.use(cors());

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
      message: 'Nossa POC atual analisa apenas mensagens de texto. Por favor, descreva sua solicitação em texto.'
    });
  }
  
  const messageType = conversationContext.detectMessageType(message);
  if (messageType === 'empty') {
    return res.status(400).json({ 
      error: 'Empty message',
      message: 'Por favor, envie uma mensagem com conteúdo válido para análise.'
    });
  }
  
  const session = conversationContext.addMessage(sessionUserId, 'user', message);
  if (!session) {
    return res.status(400).json({ 
      error: 'Invalid message content',
      message: 'Não foi possível processar sua mensagem. Verifique se contém texto válido.'
    });
  }
  
  const contextPrompt = conversationContext.buildContextPrompt(sessionUserId, message);

  const prompt = `
Você é um consultor de negócios especializado e experiente. Analise a mensagem do usuário e responda de acordo com o tipo de solicitação.

IMPORTANTE: Trate cada mensagem como uma solicitação de negócios, não como apresentação pessoal do usuário. Se o usuário mencionar um nome de empresa na primeira mensagem, ele provavelmente quer análise dessa empresa.

${contextPrompt}

**TIPO 1 - RELATÓRIO EMPRESARIAL:**
Se o usuário mencionar uma empresa específica, pedir análise de negócio, relatório, ou apresentar um caso empresarial, gere um relatório estruturado seguindo este formato:

*RELATÓRIO DE ANÁLISE EMPRESARIAL*

*RESUMO EXECUTIVO*
- Síntese do caso/empresa em 2-3 linhas

*ANÁLISE SITUACIONAL*
- Contexto atual
- Principais desafios identificados
- Oportunidades detectadas

*RECOMENDAÇÕES ESTRATÉGICAS*
- Ações prioritárias (3-5 itens)
- Cronograma sugerido
- Recursos necessários

*RISCOS E MITIGAÇÃO*
- Principais riscos identificados
- Estratégias de mitigação

*CONCLUSÃO*
- Próximos passos recomendados
- Indicadores de sucesso

**TIPO 2 - CONSULTORIA/DÚVIDAS:**
Se o usuário fizer uma pergunta específica, pedir esclarecimento sobre conceitos de negócios, ou solicitar orientação, responda de forma consultiva e educativa, fornecendo:
- Explicação clara e didática
- Exemplos práticos quando relevante
- Orientações acionáveis
- Recursos adicionais se necessário

*Diretrizes gerais:*
- Mantenha tom profissional mas acessível
- Use dados e conceitos fundamentados
- Seja específico e prático
- Adapte a linguagem ao contexto apresentado
- IMPORTANTE: Se há contexto de conversa anterior, faça referência a ele quando relevante
- NÃO assuma que o usuário está se apresentando - trate como solicitação direta de negócios

*Mensagem atual do usuário:*
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

startBot();

app.listen(PORT, () => {
  console.log('Backend running on http://localhost:' + PORT);
});
