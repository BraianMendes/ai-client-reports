const fs = require('fs').promises;
const path = require('path');
const ragService = require('../utils/ragService');

async function backupRAGSystem() {
  console.log('💾 Iniciando backup do sistema RAG...\n');
  
  try {
    await ragService.initialize();
    
    // Obter dados para backup
    const stats = await ragService.getStats();
    const exportData = await ragService.vectorStore.exportData();
    
    // Criar pasta de backup com timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '..', 'backups', `rag_backup_${timestamp}`);
    
    await fs.mkdir(backupDir, { recursive: true });
    
    // Salvar dados
    await fs.writeFile(
      path.join(backupDir, 'rag_data.json'),
      JSON.stringify(exportData, null, 2)
    );
    
    // Salvar estatísticas
    await fs.writeFile(
      path.join(backupDir, 'stats.json'),
      JSON.stringify(stats, null, 2)
    );
    
    // Copiar arquivos de configuração se existirem
    const configFiles = ['package.json', '.env'];
    for (const configFile of configFiles) {
      try {
        const sourcePath = path.join(__dirname, '..', configFile);
        const destPath = path.join(backupDir, configFile);
        await fs.copyFile(sourcePath, destPath);
      } catch (error) {
        console.log(`⚠️ Arquivo ${configFile} não encontrado, pulando...`);
      }
    }
    
    // Criar README do backup
    const readmeContent = `# Backup do Sistema RAG

**Data do Backup:** ${new Date().toLocaleString()}
**Total de Documentos:** ${stats.totalDocuments}
**Total de Embeddings:** ${stats.totalEmbeddings}

## Conteúdo do Backup

- \`rag_data.json\`: Dados completos do sistema RAG
- \`stats.json\`: Estatísticas do sistema
- \`package.json\`: Dependências do projeto
- \`.env\`: Variáveis de ambiente (se existir)

## Como Restaurar

1. Certifique-se de que o sistema RAG está inicializado
2. Execute o script de restauração apontando para este diretório
3. O sistema será restaurado com todos os documentos e embeddings

## Comando de Restauração

\`\`\`bash
node scripts/restoreRAG.js "${backupDir}"
\`\`\`
`;
    
    await fs.writeFile(
      path.join(backupDir, 'README.md'),
      readmeContent
    );
    
    console.log('✅ Backup concluído com sucesso!');
    console.log(`📁 Local: ${backupDir}`);
    console.log(`📊 Documentos salvos: ${stats.totalDocuments}`);
    console.log(`🔢 Embeddings salvos: ${stats.totalEmbeddings}`);
    
    return backupDir;
    
  } catch (error) {
    console.error('❌ Erro durante o backup:', error);
    throw error;
  }
}

async function restoreRAGSystem(backupPath) {
  console.log(`🔄 Restaurando sistema RAG de: ${backupPath}\n`);
  
  try {
    await ragService.initialize();
    
    // Verificar se o backup existe
    const dataFile = path.join(backupPath, 'rag_data.json');
    const backupData = JSON.parse(await fs.readFile(dataFile, 'utf-8'));
    
    // Confirmar restauração
    console.log(`📊 Backup contém:`);
    console.log(`   - ${backupData.documents?.length || 0} documentos`);
    console.log(`   - ${backupData.embeddings?.length || 0} embeddings`);
    console.log(`   - Criado em: ${backupData.exportedAt}`);
    
    // Limpar dados atuais
    await ragService.clearAll();
    console.log('🧹 Dados atuais limpos');
    
    // Importar dados do backup
    await ragService.vectorStore.importData(backupData);
    console.log('📥 Dados do backup importados');
    
    // Verificar resultado
    const newStats = await ragService.getStats();
    console.log('\n✅ Restauração concluída!');
    console.log(`📊 Documentos restaurados: ${newStats.totalDocuments}`);
    console.log(`🔢 Embeddings restaurados: ${newStats.totalEmbeddings}`);
    
  } catch (error) {
    console.error('❌ Erro durante a restauração:', error);
    throw error;
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  const command = process.argv[2];
  const path = process.argv[3];
  
  if (command === 'backup') {
    backupRAGSystem().then((backupPath) => {
      console.log(`\n✨ Backup salvo em: ${backupPath}`);
      process.exit(0);
    }).catch(error => {
      console.error('❌ Falha no backup:', error);
      process.exit(1);
    });
  } else if (command === 'restore' && path) {
    restoreRAGSystem(path).then(() => {
      console.log('\n✨ Restauração concluída!');
      process.exit(0);
    }).catch(error => {
      console.error('❌ Falha na restauração:', error);
      process.exit(1);
    });
  } else {
    console.log('Uso:');
    console.log('  node backupRAG.js backup          - Criar backup');
    console.log('  node backupRAG.js restore <path>  - Restaurar backup');
  }
}

module.exports = { backupRAGSystem, restoreRAGSystem };
