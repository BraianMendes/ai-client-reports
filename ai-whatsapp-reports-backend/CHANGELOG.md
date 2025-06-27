# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-06-26

### ✨ Added
- **WhatsApp Bot Integration** - Complete connection with WhatsApp Web via Baileys
- **Conversational AI** - Integration with Groq LLaMA 3 70B for business analysis
- **Context System** - Smart memory of 10 messages per session
- **Automatic Detection** - Companies, topics and conversation types
- **Security System** - Rate limiting (10 msg/min), access control
- **Message Validation** - Size, UTF-8 encoding, content
- **Complete REST API** - Endpoints for analysis, sessions and administration
- **Centralized Documentation** - Complete docs in `/docs/`

### 🔒 Security
- Rate limiting per user (10 messages per minute)
- Allowed users list with access control
- Robust input validation (2-500 chars for bot, 2-2000 for API)
- Encoding normalization and control character removal
- Security logs for unauthorized attempts

### 📊 Features
- **Conversation Types**: Report, Consultation, Follow-up
- **Supported Topics**: Marketing, Sales, Financial, Operational, HR, Strategy, Technology, Customer Service
- **Smart Context**: Automatic reference to previous conversations
- **Session Timeout**: 30 minutes of inactivity
- **Report History**: Record to avoid repetitions

### 🛠️ Technical
- Node.js + Express.js backend
- WhatsApp Web API via @whiskeysockets/baileys
- Groq API integration for AI
- In-memory context system
- CORS enabled for integrations
- PDF generation with PDFKit

### 📚 Documentation
- Complete README.md with installation and usage
- Technical documentation in `/docs/`:
  - security.md - Security system
  - context-system.md - Conversation context
  - message-validation.md - Message validation
  - limitations.md - Known limitations
  - api-reference.md - Complete API reference

### 🔧 Configuration
- Environment variables via .env
- Customizable rate limiting settings
- Adjustable timeouts and limits
- Configurable AI model

## [Unreleased]

### 🔮 Planned
- Database for persistence (PostgreSQL/MongoDB)
- Redis for distributed cache
- Media processing (OCR)
- Web administration dashboard
- Multiple AI models
- Docker containerization
- Webhooks for integrations
- Sentiment analysis
- Visual reports with charts
