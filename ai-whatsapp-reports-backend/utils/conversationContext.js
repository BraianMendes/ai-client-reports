class ConversationContext {
    constructor() {
        this.sessions = new Map();
        this.rateLimits = new Map();
        this.allowedUsers = new Set();
        this.SESSION_TIMEOUT = 30 * 60 * 1000;
        this.MAX_CONTEXT_MESSAGES = 10;
        this.RATE_LIMIT_WINDOW = 60 * 1000;
        this.RATE_LIMIT_MAX_REQUESTS = 10;
        this.MAX_MESSAGE_LENGTH = 500;
        this.MIN_MESSAGE_LENGTH = 2;
        
        setInterval(() => this.cleanExpiredSessions(), 5 * 60 * 1000);
        setInterval(() => this.cleanRateLimits(), 5 * 60 * 1000);
    }

    addAllowedUser(userId) {
        this.allowedUsers.add(userId);
    }

    removeAllowedUser(userId) {
        this.allowedUsers.delete(userId);
    }

    isUserAllowed(userId) {
        if (this.allowedUsers.size === 0) return true;
        return this.allowedUsers.has(userId);
    }

    checkRateLimit(userId) {
        const now = Date.now();
        
        if (!this.rateLimits.has(userId)) {
            this.rateLimits.set(userId, { requests: [], lastReset: now });
        }

        const userLimits = this.rateLimits.get(userId);
        userLimits.requests = userLimits.requests.filter(
            timestamp => now - timestamp < this.RATE_LIMIT_WINDOW
        );

        if (userLimits.requests.length >= this.RATE_LIMIT_MAX_REQUESTS) {
            const oldestRequest = Math.min(...userLimits.requests);
            const timeUntilReset = this.RATE_LIMIT_WINDOW - (now - oldestRequest);
            return {
                allowed: false,
                timeUntilReset: Math.ceil(timeUntilReset / 1000)
            };
        }

        userLimits.requests.push(now);
        return { allowed: true };
    }

    validateMessageLength(content) {
        if (!content || typeof content !== 'string') {
            return { valid: false, reason: 'Mensagem inválida' };
        }

        const length = content.trim().length;
        
        if (length < this.MIN_MESSAGE_LENGTH) {
            return { valid: false, reason: 'Mensagem muito curta (mínimo 2 caracteres)' };
        }

        if (length > this.MAX_MESSAGE_LENGTH) {
            return { valid: false, reason: `Mensagem muito longa (máximo ${this.MAX_MESSAGE_LENGTH} caracteres)` };
        }

        return { valid: true };
    }

    cleanRateLimits() {
        const now = Date.now();
        for (const [userId, limits] of this.rateLimits) {
            limits.requests = limits.requests.filter(
                timestamp => now - timestamp < this.RATE_LIMIT_WINDOW
            );
            if (limits.requests.length === 0) {
                this.rateLimits.delete(userId);
            }
        }
    }

    getSession(userId) {
        if (!this.sessions.has(userId)) {
            this.sessions.set(userId, {
                userId,
                messages: [],
                sessionStart: Date.now(),
                lastActivity: Date.now(),
                context: {
                    currentTopic: null,
                    companyFocus: null,
                    conversationType: null,
                    reportHistory: [],
                    userPreferences: {}
                }
            });
        }
        
        const session = this.sessions.get(userId);
        session.lastActivity = Date.now();
        return session;
    }

    addMessage(userId, role, content, messageType = 'general') {
        const session = this.getSession(userId);
        
        const cleanedContent = this.validateAndCleanContent(content, messageType);
        if (!cleanedContent) {
            console.log(`Mensagem ignorada para ${userId}: conteúdo inválido ou vazio`);
            return null;
        }
        
        const message = {
            role,
            content: cleanedContent,
            messageType,
            timestamp: Date.now()
        };

        session.messages.push(message);
        
        if (session.messages.length > this.MAX_CONTEXT_MESSAGES) {
            session.messages = session.messages.slice(-this.MAX_CONTEXT_MESSAGES);
        }

        this.updateContext(session, message);
        
        return session;
    }

    validateAndCleanContent(content, messageType) {
        if (!content || typeof content !== 'string') {
            return null;
        }

        if (messageType === 'media') {
            return 'MENSAGEM_MIDIA_DETECTADA';
        }

        let cleanedContent = content
            .replace(/[\x00-\x1F\x7F]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        if (cleanedContent.length === 0) {
            return null;
        }

        if (!/[a-zA-Z0-9\u00C0-\u017F]/.test(cleanedContent)) {
            return null;
        }

        const MAX_MESSAGE_LENGTH = 2000;
        if (cleanedContent.length > MAX_MESSAGE_LENGTH) {
            cleanedContent = cleanedContent.substring(0, MAX_MESSAGE_LENGTH) + '...';
        }

        return cleanedContent;
    }

    detectMessageType(content, hasMedia = false) {
        if (hasMedia) {
            return 'media';
        }
        
        if (!content || content.trim().length === 0) {
            return 'empty';
        }

        if (content.startsWith('/') || content.startsWith('!')) {
            return 'command';
        }

        return 'text';
    }

    getMediaResponse(mediaType = 'unknown') {
        const responses = {
            image: "📸 Recebi sua imagem! No momento, nossa POC analisa apenas mensagens de texto. Por favor, descreva o que você gostaria de analisar ou consultar em texto.",
            video: "🎥 Recebi seu vídeo! No momento, nossa POC analisa apenas mensagens de texto. Por favor, descreva o que você gostaria de analisar ou consultar em texto.",
            audio: "🔊 Recebi seu áudio! No momento, nossa POC analisa apenas mensagens de texto. Por favor, digite sua pergunta ou solicitação.",
            document: "📄 Recebi seu documento! No momento, nossa POC analisa apenas mensagens de texto. Por favor, descreva o conteúdo que você gostaria de analisar.",
            unknown: "📎 Recebi sua mídia! No momento, nossa POC analisa apenas mensagens de texto. Por favor, descreva o que você gostaria de analisar ou consultar em formato de texto."
        };
        
        return responses[mediaType] || responses.unknown;
    }

    updateContext(session, message) {
        if (message.role === 'user') {
            if (message.content === 'MENSAGEM_MIDIA_DETECTADA') {
                session.context.conversationType = 'media_not_supported';
                return;
            }

            const content = message.content.toLowerCase();
            
            const companyPatterns = [
                /(empresa|company)\s+([a-zA-Z0-9\s]+)/i,
                /([a-zA-Z0-9\s]+)\s*(ltda|s\.a\.|inc|corp|sa|me|eireli)/i,
                /(analise|análise|relatório|report|empresa|cliente)\s+(a\s+|da\s+|do\s+|de\s+)?([A-Z][a-zA-Z0-9\s]{2,})/i,
                /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g
            ];

            for (const pattern of companyPatterns) {
                const match = message.content.match(pattern);
                if (match) {
                    let companyName = match[3] || match[2] || match[1];
                    if (companyName && companyName.trim().length > 2) {
                        companyName = companyName.trim();
                        const excludeWords = ['sobre', 'como', 'onde', 'quando', 'porque', 'quem', 'qual', 'fazer', 'gerar', 'criar', 'preciso', 'quero', 'posso', 'muito', 'mais', 'menos', 'bem', 'mal'];
                        if (!excludeWords.includes(companyName.toLowerCase())) {
                            session.context.companyFocus = companyName;
                            break;
                        }
                    }
                }
            }

            if (content.includes('relatório') || content.includes('análise') || content.includes('report') || 
                content.includes('analise') || content.includes('avalie') || content.includes('examine')) {
                session.context.conversationType = 'report';
            } else if (content.includes('?') || content.includes('como') || content.includes('o que') || 
                      content.includes('porque') || content.includes('quando') || content.includes('onde') ||
                      content.includes('qual') || content.includes('quem')) {
                session.context.conversationType = 'consultation';
            } else if (session.messages.filter(m => m.role === 'user' && m.content !== 'MENSAGEM_MIDIA_DETECTADA').length > 1) {
                session.context.conversationType = 'follow_up';
            } else {
                if (session.context.companyFocus) {
                    session.context.conversationType = 'report';
                } else {
                    session.context.conversationType = 'consultation';
                }
            }

            const topics = {
                'marketing': ['marketing', 'publicidade', 'propaganda', 'divulgação', 'branding', 'marca'],
                'vendas': ['vendas', 'venda', 'comercial', 'receita', 'faturamento', 'cliente'],
                'financeiro': ['financeiro', 'financeira', 'finanças', 'contabilidade', 'lucro', 'custos', 'investimento'],
                'operacional': ['operacional', 'operações', 'produção', 'logística', 'supply', 'processo'],
                'rh': ['rh', 'recursos humanos', 'pessoal', 'funcionários', 'colaboradores', 'equipe', 'treinamento'],
                'estratégia': ['estratégia', 'estratégico', 'planejamento', 'growth', 'expansão', 'mercado'],
                'tecnologia': ['tecnologia', 'ti', 'digital', 'software', 'sistema', 'automação', 'inovação'],
                'atendimento': ['atendimento', 'suporte', 'sac', 'relacionamento', 'experiência', 'satisfação']
            };

            for (const [topic, keywords] of Object.entries(topics)) {
                if (keywords.some(keyword => content.includes(keyword))) {
                    session.context.currentTopic = topic;
                    break;
                }
            }
        }

        if (message.role === 'assistant' && message.messageType === 'report') {
            session.context.reportHistory.push({
                timestamp: Date.now(),
                topic: session.context.currentTopic,
                company: session.context.companyFocus
            });
        }
    }

    buildContextPrompt(userId, currentMessage) {
        const session = this.getSession(userId);
        
        let contextPrompt = '';
        
        if (session.messages.length > 0) {
            contextPrompt += '\n**CONTEXTO DA CONVERSA:**\n';
            
            const recentMessages = session.messages.slice(-3);
            recentMessages.forEach(msg => {
                const role = msg.role === 'user' ? 'Usuário' : 'Assistente';
                contextPrompt += `${role}: ${msg.content.substring(0, 150)}...\n`;
            });
        }

        if (session.context.companyFocus) {
            contextPrompt += `\n**EMPRESA EM FOCO:** ${session.context.companyFocus}\n`;
        }

        if (session.context.currentTopic) {
            contextPrompt += `**TÓPICO ATUAL:** ${session.context.currentTopic}\n`;
        }

        if (session.context.conversationType) {
            contextPrompt += `**TIPO DE CONVERSA:** ${session.context.conversationType}\n`;
        }

        if (session.context.reportHistory.length > 0) {
            contextPrompt += `**RELATÓRIOS ANTERIORES:** ${session.context.reportHistory.length} relatórios gerados nesta sessão\n`;
        }

        return contextPrompt;
    }

    cleanExpiredSessions() {
        const now = Date.now();
        for (const [userId, session] of this.sessions) {
            if (now - session.lastActivity > this.SESSION_TIMEOUT) {
                this.sessions.delete(userId);
                console.log(`Sessão expirada removida: ${userId}`);
            }
        }
    }

    getSessionStats(userId) {
        const session = this.getSession(userId);
        return {
            messageCount: session.messages.length,
            sessionDuration: Date.now() - session.sessionStart,
            reportCount: session.context.reportHistory.length,
            currentTopic: session.context.currentTopic,
            companyFocus: session.context.companyFocus
        };
    }

    resetSession(userId) {
        if (this.sessions.has(userId)) {
            this.sessions.delete(userId);
        }
    }
}

module.exports = new ConversationContext();
