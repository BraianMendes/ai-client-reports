const ragService = require('../utils/ragService');

async function populateKnowledgeBase() {
  console.log('🚀 Iniciando população da base de conhecimento...');
  
  try {
    await ragService.initialize();
    
    // Exemplos de conhecimento empresarial
    const knowledgeItems = [
      {
        text: `
ANÁLISE SWOT - Metodologia de Análise Estratégica

A Análise SWOT (Strengths, Weaknesses, Opportunities, Threats) é uma ferramenta fundamental para análise estratégica empresarial.

COMPONENTES:
- Forças (Strengths): Características internas positivas da empresa
- Fraquezas (Weaknesses): Aspectos internos que precisam ser melhorados
- Oportunidades (Opportunities): Fatores externos favoráveis ao negócio
- Ameaças (Threats): Elementos externos que podem prejudicar a empresa

COMO APLICAR:
1. Levante dados sobre o ambiente interno e externo
2. Classifique cada item nas 4 categorias
3. Priorize os itens mais relevantes
4. Desenvolva estratégias baseadas na matriz SWOT
5. Monitore e atualize regularmente

ESTRATÉGIAS SWOT:
- FO (Forças + Oportunidades): Estratégias de crescimento
- FA (Forças + Ameaças): Estratégias defensivas
- FrO (Fraquezas + Oportunidades): Estratégias de desenvolvimento
- FrA (Fraquezas + Ameaças): Estratégias de sobrevivência
        `,
        metadata: {
          title: 'Análise SWOT',
          category: 'metodologia',
          type: 'strategic_analysis'
        }
      },
      {
        text: `
INDICADORES FINANCEIROS ESSENCIAIS

LIQUIDEZ:
- Liquidez Corrente = Ativo Circulante / Passivo Circulante
- Liquidez Seca = (Ativo Circulante - Estoques) / Passivo Circulante
- Liquidez Imediata = Disponível / Passivo Circulante

RENTABILIDADE:
- ROE (Return on Equity) = Lucro Líquido / Patrimônio Líquido
- ROA (Return on Assets) = Lucro Líquido / Ativo Total
- Margem Líquida = Lucro Líquido / Receita Líquida
- Margem Bruta = Lucro Bruto / Receita Líquida

ENDIVIDAMENTO:
- Índice de Endividamento = Passivo Total / Ativo Total
- Composição do Endividamento = Passivo Circulante / Passivo Total
- Grau de Alavancagem = Passivo Total / Patrimônio Líquido

ATIVIDADE:
- Giro do Ativo = Receita Líquida / Ativo Total
- Giro do Estoque = CMV / Estoque Médio
- Prazo Médio de Recebimento = (Contas a Receber / Vendas) × 365
        `,
        metadata: {
          title: 'Indicadores Financeiros',
          category: 'financeiro',
          type: 'kpi'
        }
      },
      {
        text: `
MODELO DE NEGÓCIOS CANVAS

O Business Model Canvas é uma ferramenta visual para desenvolver e descrever modelos de negócio.

OS 9 BLOCOS:
1. SEGMENTOS DE CLIENTES: Quem são seus clientes-alvo?
2. PROPOSTA DE VALOR: Que valor você entrega aos clientes?
3. CANAIS: Como você alcança e entrega valor aos clientes?
4. RELACIONAMENTO COM CLIENTES: Que tipo de relacionamento mantém?
5. FONTES DE RECEITA: Como o negócio gera dinheiro?
6. RECURSOS-CHAVE: Quais recursos são essenciais?
7. ATIVIDADES-CHAVE: Quais atividades são fundamentais?
8. PARCERIAS-CHAVE: Quem são os parceiros e fornecedores?
9. ESTRUTURA DE CUSTOS: Quais são os custos principais?

BENEFÍCIOS:
- Visão holística do negócio
- Facilita comunicação da estratégia
- Identifica pontos de melhoria
- Permite comparação com concorrentes
- Base para plano de negócios
        `,
        metadata: {
          title: 'Business Model Canvas',
          category: 'metodologia',
          type: 'business_model'
        }
      },
      {
        text: `
ANÁLISE DE CONCORRÊNCIA - FRAMEWORK COMPLETO

IDENTIFICAÇÃO DE CONCORRENTES:
- Concorrentes Diretos: Mesmo produto/serviço, mesmo mercado
- Concorrentes Indiretos: Produtos substitutos
- Concorrentes Potenciais: Podem entrar no mercado

DIMENSÕES DE ANÁLISE:
1. PRODUTO/SERVIÇO:
   - Características e funcionalidades
   - Qualidade e diferenciação
   - Portfolio e variedade
   - Inovação e desenvolvimento

2. PREÇOS E ESTRATÉGIA:
   - Estratégia de precificação
   - Posicionamento no mercado
   - Promoções e descontos
   - Modelo de receita

3. MARKETING E VENDAS:
   - Canais de distribuição
   - Estratégias de comunicação
   - Presença digital
   - Força de vendas

4. OPERAÇÕES:
   - Capacidade produtiva
   - Eficiência operacional
   - Tecnologia utilizada
   - Cadeia de suprimentos

5. FINANCEIRO:
   - Participação de mercado
   - Crescimento de receita
   - Lucratividade
   - Investimentos

FERRAMENTAS:
- Matriz de Posicionamento
- Análise de Gap
- Benchmarking
- Mystery Shopping
- Análise de Sites e Redes Sociais
        `,
        metadata: {
          title: 'Análise de Concorrência',
          category: 'market_intelligence',
          type: 'competitive_analysis'
        }
      },
      {
        text: `
METODOLOGIAS ÁGEIS PARA NEGÓCIOS

SCRUM PARA NEGÓCIOS:
- Sprints de planejamento estratégico
- Daily standups para alinhamento de equipe
- Reviews para avaliação de resultados
- Retrospectivas para melhoria contínua

LEAN STARTUP:
- Build-Measure-Learn (Construir-Medir-Aprender)
- MVP (Minimum Viable Product)
- Pivoting (mudança de direção baseada em dados)
- Validated Learning

DESIGN THINKING:
1. Empatizar: Entender o usuário
2. Definir: Identificar o problema
3. Idear: Gerar soluções
4. Prototipar: Criar versões de teste
5. Testar: Validar com usuários

OKRs (Objectives and Key Results):
- Objetivos: O que queremos alcançar
- Resultados-chave: Como medimos o progresso
- Ciclos trimestrais
- Transparência organizacional
- Foco em impacto

KANBAN:
- Visualização do fluxo de trabalho
- Limitação de trabalho em progresso
- Melhoria contínua
- Flexibilidade de processo
        `,
        metadata: {
          title: 'Metodologias Ágeis',
          category: 'metodologia',
          type: 'agile'
        }
      }
    ];

    console.log(`📚 Adicionando ${knowledgeItems.length} itens de conhecimento...`);
    
    for (const item of knowledgeItems) {
      await ragService.addKnowledge(item.text, item.metadata);
      console.log(`✅ Adicionado: ${item.metadata.title}`);
    }
    
    const stats = await ragService.getStats();
    console.log('\n📊 Estatísticas finais:', stats);
    console.log('\n🎉 Base de conhecimento populada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao popular base de conhecimento:', error);
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  populateKnowledgeBase().then(() => {
    console.log('✨ Processo concluído!');
    process.exit(0);
  });
}

module.exports = { populateKnowledgeBase };
