const ragService = require('../utils/ragService');
const path = require('path');

async function addDocumentsFromFolder() {
  console.log('📁 Adicionando documentos da pasta knowledge_base...\n');
  
  try {
    await ragService.initialize();
    
    const knowledgeBasePath = path.join(__dirname, '..', 'knowledge_base');
    console.log(`📂 Processando pasta: ${knowledgeBasePath}`);
    
    const results = await ragService.addDirectory(knowledgeBasePath);
    
    console.log('\n📊 Resultados:');
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.metadata.fileName}`);
      console.log(`   - Documento principal: ${result.mainDocId}`);
      console.log(`   - Chunks: ${result.totalChunks}`);
      console.log(`   - Palavras: ${result.metadata.wordCount}`);
      console.log('');
    });
    
    const stats = await ragService.getStats();
    console.log('📈 Estatísticas finais:', stats);
    
  } catch (error) {
    console.error('❌ Erro ao processar documentos:', error);
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  addDocumentsFromFolder().then(() => {
    console.log('✨ Processamento concluído!');
    process.exit(0);
  });
}

module.exports = { addDocumentsFromFolder };
