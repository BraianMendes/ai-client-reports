const axios = require('axios');

const API_BASE = 'http://localhost:3003';

async function addSampleKnowledge() {
  const sampleData = [
    {
      text: "A análise SWOT é uma ferramenta estratégica fundamental para avaliação de empresas. Ela analisa Forças (Strengths), Fraquezas (Weaknesses), Oportunidades (Opportunities) e Ameaças (Threats). É utilizada para desenvolver estratégias competitivas e identificar posicionamento no mercado.",
      metadata: {
        title: "Análise SWOT - Conceitos Fundamentais",
        category: "metodologia",
        source: "manual"
      }
    },
    {
      text: "O modelo de Canvas é uma ferramenta visual para desenvolvimento de modelos de negócio. Ele é composto por 9 blocos: Segmentos de Clientes, Proposta de Valor, Canais, Relacionamento com Clientes, Fontes de Receita, Recursos-Chave, Atividades-Chave, Parcerias-Chave e Estrutura de Custos.",
      metadata: {
        title: "Business Model Canvas",
        category: "metodologia",
        source: "manual"
      }
    },
    {
      text: "Indicadores de performance (KPIs) são métricas quantificáveis que demonstram a eficácia de uma empresa em atingir seus objetivos de negócio. Exemplos comuns incluem: ROI (Return on Investment), Customer Lifetime Value (CLV), taxa de conversão, NPS (Net Promoter Score) e margem de lucro.",
      metadata: {
        title: "Key Performance Indicators (KPIs)",
        category: "financeiro",
        source: "manual"
      }
    },
    {
      text: "A metodologia Scrum é um framework ágil para gerenciamento de projetos. Principais elementos: Sprints (períodos de 2-4 semanas), Daily Standup (reuniões diárias), Sprint Planning, Sprint Review e Sprint Retrospective. Papéis incluem Product Owner, Scrum Master e Development Team.",
      metadata: {
        title: "Metodologia Scrum",
        category: "gestao-projetos",
        source: "manual"
      }
    },
    {
      text: "Marketing digital engloba todas as estratégias de marketing realizadas online. Principais canais: SEO (Search Engine Optimization), SEM (Search Engine Marketing), redes sociais, e-mail marketing, marketing de conteúdo e marketing de influência. ROI digital pode ser medido através de ferramentas como Google Analytics.",
      metadata: {
        title: "Estratégias de Marketing Digital",
        category: "marketing",
        source: "manual"
      }
    }
  ];

  console.log('🚀 Adding sample knowledge...');
  
  for (const item of sampleData) {
    try {
      const response = await axios.post(`${API_BASE}/rag/add-knowledge`, item);
      console.log(`✅ Added: ${item.metadata.title}`);
    } catch (error) {
      console.error(`❌ Erro ao adicionar ${item.metadata.title}:`, error.message);
    }
  }
  
  console.log('✅ Process completed!');
}

addSampleKnowledge();
