const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { parse } = require('node-html-parser');

class DocumentProcessor {
  constructor() {
    this.supportedExtensions = ['.txt', '.pdf', '.docx', '.html', '.json', '.md'];
  }

  async processFile(filePath) {
    try {
      const ext = path.extname(filePath).toLowerCase();
      const fileName = path.basename(filePath);
      
      console.log(`📄 Processing file: ${fileName}`);
      
      let content = '';
      let metadata = {
        fileName,
        filePath,
        fileType: ext,
        processedAt: new Date().toISOString(),
        wordCount: 0,
        source: 'file'
      };

      switch (ext) {
        case '.txt':
        case '.md':
          content = await this.processTxtFile(filePath);
          break;
        case '.pdf':
          content = await this.processPdfFile(filePath);
          break;
        case '.docx':
          content = await this.processDocxFile(filePath);
          break;
        case '.html':
          content = await this.processHtmlFile(filePath);
          break;
        case '.json':
          content = await this.processJsonFile(filePath);
          break;
        default:
          throw new Error(`Tipo de arquivo não suportado: ${ext}`);
      }

      // Limpa e valida o conteúdo
      content = this.cleanContent(content);
      metadata.wordCount = content.split(/\s+/).length;

      if (content.length < 50) {
        console.warn(`⚠️ Conteúdo muito pequeno em ${fileName}`);
      }

      // Divide em chunks para melhor processamento
      const chunks = this.createChunks(content, 1000, 100);
      
      return {
        content,
        chunks,
        metadata
      };

    } catch (error) {
      console.error(`❌ Erro ao processar arquivo ${filePath}:`, error.message);
      throw error;
    }
  }

  async processTxtFile(filePath) {
    const buffer = await fs.readFile(filePath);
    return buffer.toString('utf-8');
  }

  async processPdfFile(filePath) {
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  async processDocxFile(filePath) {
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  async processHtmlFile(filePath) {
    const html = await fs.readFile(filePath, 'utf-8');
    const root = parse(html);
    
    // Remove scripts e styles
    root.querySelectorAll('script, style').forEach(el => el.remove());
    
    return root.text;
  }

  async processJsonFile(filePath) {
    const jsonContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(jsonContent);
    
    // Extrai texto relevante do JSON
    return this.extractTextFromJson(data);
  }

  extractTextFromJson(obj, depth = 0) {
    if (depth > 5) return ''; // Evita recursão infinita
    
    let text = '';
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        text += `${key}: ${value}\n`;
      } else if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === 'string') {
              text += `${key}[${index}]: ${item}\n`;
            } else if (typeof item === 'object') {
              text += this.extractTextFromJson(item, depth + 1);
            }
          });
        } else {
          text += this.extractTextFromJson(value, depth + 1);
        }
      }
    }
    
    return text;
  }

  cleanContent(content) {
    return content
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  createChunks(text, chunkSize = 1000, overlap = 100) {
    const chunks = [];
    const words = text.split(/\s+/);
    
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      if (chunk.trim().length > 50) { // Só adiciona chunks significativos
        chunks.push({
          content: chunk.trim(),
          startIndex: i,
          wordCount: Math.min(chunkSize, words.length - i)
        });
      }
    }
    
    return chunks;
  }

  async processDirectory(dirPath) {
    const results = [];
    
    try {
      const files = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(dirPath, file.name);
        
        if (file.isFile() && this.isSupported(file.name)) {
          try {
            const result = await this.processFile(fullPath);
            results.push(result);
          } catch (error) {
            console.error(`❌ Erro ao processar ${file.name}:`, error.message);
          }
        } else if (file.isDirectory()) {
          // Recursivamente processa subdiretórios
          const subResults = await this.processDirectory(fullPath);
          results.push(...subResults);
        }
      }
    } catch (error) {
      console.error(`❌ Erro ao processar diretório ${dirPath}:`, error.message);
    }
    
    return results;
  }

  isSupported(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    return this.supportedExtensions.includes(ext);
  }

  async processUrl(url) {
    // Para futuras implementações de web scraping
    throw new Error('Processamento de URLs ainda não implementado');
  }
}

module.exports = new DocumentProcessor();
