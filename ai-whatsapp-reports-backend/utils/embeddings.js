const { pipeline } = require('@xenova/transformers');

class EmbeddingService {
  constructor() {
    this.embedder = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('Loading embeddings model...');
      // Using small and efficient multilingual model
      this.embedder = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2',
        { quantized: true }
      );
      this.initialized = true;
      console.log('✅ Embeddings model loaded successfully!');
    } catch (error) {
      console.error('❌ Error loading embeddings model:', error);
      throw error;
    }
  }

  async generateEmbedding(text) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Clean and prepare the text
      const cleanText = this.preprocessText(text);
      
      // Generate the embedding
      const output = await this.embedder(cleanText, {
        pooling: 'mean',
        normalize: true,
      });
      
      // Convert to simple array
      return Array.from(output.data);
    } catch (error) {
      console.error('❌ Error generating embedding:', error);
      throw error;
    }
  }

  async generateEmbeddings(texts) {
    const embeddings = [];
    for (const text of texts) {
      const embedding = await this.generateEmbedding(text);
      embeddings.push(embedding);
    }
    return embeddings;
  }

  // Optimized batch processing
  async generateEmbeddingsBatch(texts, batchSize = 10) {
    if (!this.initialized) {
      await this.initialize();
    }

    const embeddings = [];
    console.log(`🔄 Processing ${texts.length} texts in batches of ${batchSize}...`);
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      console.log(`📊 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(texts.length/batchSize)}`);
      
      const batchEmbeddings = await Promise.all(
        batch.map(text => this.generateEmbedding(text))
      );
      
      embeddings.push(...batchEmbeddings);
    }
    
    return embeddings;
  }

  preprocessText(text) {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 512); // Limit size for efficiency
  }

  // Calculate cosine similarity between two embeddings
  cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

module.exports = new EmbeddingService();
