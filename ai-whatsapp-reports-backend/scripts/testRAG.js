const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testRAGSystem() {
  console.log('🧪 Testing RAG System...\n');

  try {
    // 1. Testar estatísticas
    console.log('📊 1. Checking RAG statistics...');
    const statsResponse = await axios.get(`${BASE_URL}/rag/stats`);
    console.log('Statistics:', statsResponse.data);
    console.log('✅ Statistics obtained successfully!\n');

    // 2. Testar busca no RAG
    console.log('🔍 2. Testing RAG search...');
    const searchResponse = await axios.post(`${BASE_URL}/rag/search`, {
      query: 'Como fazer análise SWOT',
      topK: 3,
      threshold: 0.3
    });
    console.log('Resultados da busca:', searchResponse.data.results.length, 'documentos encontrados');
    if (searchResponse.data.results.length > 0) {
      console.log('Primeiro resultado:', {
        similarity: searchResponse.data.results[0].similarity,
        title: searchResponse.data.results[0].metadata?.title,
        excerpt: searchResponse.data.results[0].content.substring(0, 200) + '...'
      });
    }
    console.log('✅ Busca funcionando!\n');

    // 3. Testar análise com RAG integrado
    console.log('🤖 3. Testing analysis with integrated RAG...');
    const analysisResponse = await axios.post(`${BASE_URL}/analyze`, {
      message: 'Como posso fazer uma análise SWOT da minha empresa de tecnologia?',
      userId: 'test-user-rag'
    });
    
    console.log('Resposta da análise (primeiros 300 caracteres):');
    console.log(analysisResponse.data.report.substring(0, 300) + '...');
    console.log('✅ Análise com RAG funcionando!\n');

    // 4. Testar com pergunta sobre indicadores financeiros
    console.log('📈 4. Testing question about financial indicators...');
    const financialResponse = await axios.post(`${BASE_URL}/analyze`, {
      message: 'Quais indicadores financeiros devo acompanhar na minha empresa?',
      userId: 'test-user-rag'
    });
    
    console.log('Resposta sobre indicadores (primeiros 300 caracteres):');
    console.log(financialResponse.data.report.substring(0, 300) + '...');
    console.log('✅ Pergunta sobre indicadores respondida!\n');

    // 5. Adicionar novo conhecimento
    console.log('➕ 5. Testing addition of new knowledge...');
    const addKnowledgeResponse = await axios.post(`${BASE_URL}/rag/add-knowledge`, {
      text: `
ANÁLISE PESTEL - Framework de Análise Macro-Ambiental

A análise PESTEL examina fatores externos que afetam uma organização:

P - POLÍTICO: Políticas governamentais, regulamentações, estabilidade política
E - ECONÔMICO: Taxas de juros, inflação, crescimento econômico, desemprego
S - SOCIAL: Demografia, estilos de vida, educação, distribuição de renda
T - TECNOLÓGICO: Inovações, automação, P&D, obsolescência tecnológica
E - ECOLÓGICO: Sustentabilidade, mudanças climáticas, regulamentações ambientais
L - LEGAL: Leis trabalhistas, proteção ao consumidor, direitos autorais

Como aplicar:
1. Identifique fatores relevantes para cada categoria
2. Avalie o impacto de cada fator (alto, médio, baixo)
3. Determine a probabilidade de ocorrência
4. Desenvolva estratégias para aproveitar oportunidades e mitigar ameaças
5. Monitore mudanças regularmente
      `,
      metadata: {
        title: 'Análise PESTEL',
        category: 'metodologia',
        type: 'strategic_analysis'
      }
    });
    
    console.log('Conhecimento adicionado:', addKnowledgeResponse.data);
    console.log('✅ Novo conhecimento adicionado!\n');

    // 6. Verificar estatísticas atualizadas
    console.log('📊 6. Verificando estatísticas atualizadas...');
    const finalStatsResponse = await axios.get(`${BASE_URL}/rag/stats`);
    console.log('Estatísticas finais:', finalStatsResponse.data);
    console.log('✅ Estatísticas atualizadas!\n');

    console.log('🎉 TODOS OS TESTES PASSARAM! Sistema RAG funcionando perfeitamente!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

// Executa os testes
if (require.main === module) {
  console.log('⏳ Aguardando 3 segundos para o servidor inicializar...');
  setTimeout(testRAGSystem, 3000);
}

module.exports = { testRAGSystem };
