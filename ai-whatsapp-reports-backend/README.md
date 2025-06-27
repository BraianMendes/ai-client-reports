# 🤖 AI WhatsApp Reports Backend

> **Automated business report generation system via WhatsApp with Artificial Intelligence**

A complete solution that combines WhatsApp Bot, conversational AI, and REST APIs for intelligent business analysis with conversation context, robust security, and advanced message validation.

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🛠️ Technologies](#️-technologies)
- [🚀 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🔄 How to Use](#-how-to-use)
- [📡 API Reference](#-api-reference)
- [🧠 Context System](#-context-system)
- [🔒 Security](#-security)
- [📊 Limitations](#-limitations)
- [🔮 Future Improvements](#-future-improvements)
- [📚 Documentation](#-documentation)
- [👨‍💻 Contributing](#-contributing)
- [📄 License](#-license)

## 🎯 Overview

The **AI WhatsApp Reports Backend** is a business analysis platform that uses AI to generate detailed reports through natural conversations on WhatsApp. The system maintains conversational context, automatically detects companies and topics, and offers personalized analyses with robust security.

### 🌟 Key Features

- **🤖 Intelligent WhatsApp Bot** - Native integration with WhatsApp Web
- **🧠 Conversational AI** - Powered by Groq LLaMA 3 70B
- **💭 Smart Context** - 10-message memory with automatic detection
- **🔐 Advanced Security** - Rate limiting, access control and validation
- **📊 Business Analysis** - Structured reports and specialized consulting
- **🔄 REST API** - Complete endpoints for integration

## ✨ Features

### 🤖 **WhatsApp Bot**
- ✅ Automatic connection via QR Code
- ✅ Text message processing
- ✅ Friendly detection and response for media
- ✅ UTF-8 encoding normalization
- ✅ Size and content validation

### 🧠 **Context System**
- ✅ **Smart Memory**: 10 messages per session
- ✅ **Automatic Detection**: Companies, topics and conversation types
- ✅ **Timeout**: 30 minutes of inactivity
- ✅ **Conversation Types**: Report, consulting, follow-up
- ✅ **History**: Record of generated reports

### 🔒 **Security**
- ✅ **Rate Limiting**: 10 messages per minute
- ✅ **Access Control**: Allowed users list
- ✅ **Validation**: Size (2-500 chars), encoding, content
- ✅ **Logs**: Attempts and blocks logging
- ✅ **Admin Endpoints**: User management

### 📊 **Business Analysis**
- ✅ **Structured Reports**: Complete company analysis
- ✅ **Specialized Consulting**: Topic-oriented guidance
- ✅ **Supported Topics**: Marketing, sales, financial, operational, HR, strategy, technology, customer service
- ✅ **Contextual Reference**: Automatic connection between conversations

## 🛠️ Technologies

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **@whiskeysockets/baileys** - WhatsApp Web API
- **Axios** - HTTP client

### **AI & APIs**
- **Groq API** - LLaMA 3 70B model
- **OpenAI Compatible** - Standard format

### **Utilities**
- **dotenv** - Environment variables management
- **cors** - Cross-origin requests
- **pdfkit** - PDF generation
- **qrcode-terminal** - Terminal QR Code

## 🚀 Installation

### **Prerequisites**
- Node.js 16+ installed
- NPM or Yarn
- [Groq](https://groq.com) account for API key

### **1. Clone the Repository**
```bash
git clone <repository-url>
cd ai-whatsapp-reports-backend
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Configure Environment Variables**
```bash
cp .env.example .env
```

Edit the `.env` file:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama3-70b-8192
GROQ_URL=https://api.groq.com/openai/v1/chat/completions
PORT=3001
ANALYZE_API_URL=http://localhost:3001/analyze
```

### **4. Start the Server**
```bash
npm start
```

### **5. Connect WhatsApp**
1. Run the command above
2. Scan the QR Code that appears in the terminal with WhatsApp
3. Wait for the "WhatsApp connected!" message

## ⚙️ Configuration

### **Environment Variables**

| Variable | Description | Default |
|----------|-------------|---------|
| `GROQ_API_KEY` | Groq API Key (required) | - |
| `GROQ_MODEL` | AI Model | `llama3-70b-8192` |
| `GROQ_URL` | Groq API URL | `https://api.groq.com/openai/v1/chat/completions` |
| `PORT` | Server port | `3001` |
| `ANALYZE_API_URL` | Analysis API URL | `http://localhost:3001/analyze` |

### **Security Settings**

Settings are in the `utils/conversationContext.js` file:

```javascript
SESSION_TIMEOUT = 30 * 60 * 1000;       // 30 minutes
MAX_CONTEXT_MESSAGES = 10;              // 10 messages
RATE_LIMIT_WINDOW = 60 * 1000;          // 1 minute  
RATE_LIMIT_MAX_REQUESTS = 10;           // 10 messages
MIN_MESSAGE_LENGTH = 2;                 // Minimum 2 chars
MAX_MESSAGE_LENGTH = 500;               // Maximum 500 chars (Bot)
MAX_MESSAGE_LENGTH_API = 2000;          // Maximum 2000 chars (API)
```

## 🔄 How to Use

### **Via WhatsApp**

1. **Send a message** to the connected number:
   ```
   Analyze Amazon
   ```

2. **Continue the conversation** with context:
   ```
   What about their marketing?
   How to apply this to my company?
   ```

3. **Ask specific questions**:
   ```
   How to improve sales?
   Growth strategies
   ```

### **Via REST API**

```bash
# Generate report
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{"message": "Analyze Tesla", "userId": "user123"}'

# Query session
curl http://localhost:3001/session/user123

# Reset session
curl -X DELETE http://localhost:3001/session/user123
```

## 📡 API Reference

### **POST** `/analyze`
Generates business analysis with context.

**Request:**
```json
{
  "message": "Analyze Amazon",
  "userId": "5511999999999@s.whatsapp.net"
}
```

**Response:**
```json
{
  "analysis": "## BUSINESS ANALYSIS REPORT\n\n**COMPANY:** Amazon...",
  "context": {
    "companyFocus": "Amazon",
    "currentTopic": "general",
    "conversationType": "report"
  }
}
```

### **GET** `/session/{userId}`
Returns user session statistics.

**Response:**
```json
{
  "messageCount": 5,
  "sessionDuration": 300000,
  "reportCount": 2,
  "currentTopic": "marketing",
  "companyFocus": "Amazon"
}
```

### **DELETE** `/session/{userId}`
Removes user session and history.

**Response:**
```json
{
  "message": "Session deleted successfully"
}
```

### **POST** `/admin/allow-user`
Adds user to allowed list.

**Request:**
```json
{
  "userId": "5511999999999@s.whatsapp.net"
}
```

### **GET** `/admin/allowed-users`
Lists allowed users in the system.

## 🧠 Context System

### **Features**
- **Memory**: Last 10 messages per user
- **Detection**: Companies, topics and automatic types
- **Timeout**: 30 minutes of inactivity
- **Cleanup**: Automatic removal of expired sessions

### **Conversation Types**
1. **Report** - Complete business reports
2. **Consultation** - Consulting and guidance
3. **Follow-up** - Context-based continuation

### **Detected Topics**
- Marketing, Sales, Financial, Operational
- HR, Strategy, Technology, Customer Service

## 🔒 Security

### **Rate Limiting**
- **10 messages per minute** per user
- **Automatic blocking** in case of spam
- **Automatic reset** of time window

### **Access Control**
- **Allowed users list** (optional)
- **WhatsApp userId validation**
- **Unauthorized attempts logs**

### **Message Validation**
- **Size**: 2-500 characters (Bot), 2-2000 (API)
- **Encoding**: UTF-8 with normalization
- **Content**: Control character removal
- **Media**: Friendly response for images/videos

## 📊 Limitations

### **Technical**
- **In-memory sessions** - Lost on restart
- **AI Model** - Dependent on Groq API
- **WhatsApp Web** - Requires stable connection
- **Rate Limits** - 10 messages/minute per user

### **Functional**
- **Text only** - Doesn't process media directly
- **Portuguese/English** - Optimized for these languages
- **Limited context** - 10 messages per session
- **Timeout** - 30 minutes of inactivity

## 🔮 Future Improvements

### **Architecture**
- [ ] **Database** - PostgreSQL/MongoDB for persistence
- [ ] **Redis** - Distributed cache for sessions
- [ ] **Docker** - Complete containerization
- [ ] **Microservices** - Separation of responsibilities

### **Features**
- [ ] **Media processing** - OCR for images/documents
- [ ] **Multiple languages** - International support
- [ ] **Webhooks** - External system integrations
- [ ] **Web dashboard** - Administration interface

### **AI & Analytics**
- [ ] **Multiple models** - OpenAI, Anthropic, local models
- [ ] **Sentiment analysis** - Mood/urgency detection
- [ ] **Visual reports** - Charts and dashboards
- [ ] **Advanced history** - Search and comparisons

### **Security**
- [ ] **JWT Authentication** - Access tokens
- [ ] **Encryption** - Messages and sensitive data
- [ ] **Auditing** - Detailed logs and compliance
- [ ] **Advanced rate limiting** - By IP, by company

## 📚 Documentation

Complete documentation is available in the `docs/` folder:

- **[README.md](docs/README.md)** - Overview and installation
- **[security.md](docs/security.md)** - Security system
- **[context-system.md](docs/context-system.md)** - Conversation context
- **[message-validation.md](docs/message-validation.md)** - Message validation
- **[limitations.md](docs/limitations.md)** - Known limitations
- **[api-reference.md](docs/api-reference.md)** - Complete API reference

## 👨‍💻 Contributing

### **How to Contribute**
1. Fork the project
2. Create a branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add: new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

### **Code Standards**
- **ESLint** for linting
- **Comments** only when necessary
- **Small functions** and focused
- **Descriptive names** for variables and functions

### **Project Structure**
```
ai-whatsapp-reports-backend/
├── index.js                 # Main server
├── bot.js                   # WhatsApp bot logic
├── package.json            # Dependencies
├── .env                    # Environment variables
├── auth_info/              # WhatsApp session
├── utils/
│   ├── conversationContext.js  # Context system
│   └── pdf.js              # PDF generation
└── docs/                   # Documentation
    ├── README.md
    ├── security.md
    ├── context-system.md
    ├── message-validation.md
    ├── limitations.md
    └── api-reference.md
```

## 📄 License

This project is under the **ISC** license. See the [LICENSE](LICENSE) file for more details.

---

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone <repository-url>
cd ai-whatsapp-reports-backend
npm install

# 2. Configure
cp .env.example .env
# Edit .env with your GROQ_API_KEY

# 3. Run
npm start

# 4. Scan QR Code in terminal
# 5. Send "Analyze Amazon" on WhatsApp
```

---

**Developed with ❤️ by [BraianMendes](https://github.com/BraianMendes)**

> **Note**: This project is in active development. To report bugs or suggest improvements, open an [issue](https://github.com/your-repo/issues).
