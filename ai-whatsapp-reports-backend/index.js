require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { startBot } = require('./bot');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3001;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = process.env.GROQ_URL || 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama3-70b-8192';

app.post('/analyze', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message' });

  const prompt = `
Você é um consultor de negócios. Gere um relatório detalhado para o seguinte caso:
${message}
`;

  try {
    const completion = await axios.post(
      GROQ_URL,
      {
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 512,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );
    res.json({ report: completion.data.choices[0].message.content });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

startBot();

app.listen(PORT, () => {
  console.log('Backend running on http://localhost:' + PORT);
});
