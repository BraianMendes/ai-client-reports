# 📚 API Reference

## 🎯 **Main Endpoints**

### **POST /analyze**
Processes message and generates report or consulting.

**Request:**
```http
POST /analyze
Content-Type: application/json

{
  "message": "Analyze Amazon",
"userId": "5511999999999@s.whatsapp.net"
}
```

**Response:**
```json
{
  "report": "Generated report...",
  "sessionStats": {
    "messageCount": 3,
    "sessionDuration": 120000,
    "reportCount": 1,
    "currentTopic": "strategy",
    "companyFocus": "Amazon"
  }
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid or empty message
- `422`: Unsupported media
- `500`: Internal error

## 🔧 **Session Endpoints**

### **GET /session/:userId**
Gets user session statistics.

**Response:**
```json
{
  "messageCount": 5,
  "sessionDuration": 300000,
  "reportCount": 2,
  "currentTopic": "marketing",
  "companyFocus": "Tesla"
}
```

### **DELETE /session/:userId**
Resets user session.

**Response:**
```json
{
  "message": "Session reset successfully"
}
```

### **GET /conversation/:userId**
Gets conversation history.

**Response:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Amazon",
      "messageType": "general",
      "timestamp": 1640995200000
    },
    {
      "role": "assistant", 
      "content": "Amazon report...",
      "messageType": "report",
      "timestamp": 1640995210000
    }
  ],
  "context": {
    "currentTopic": "strategy",
    "companyFocus": "Amazon",
    "conversationType": "report",
    "reportHistory": [...]
  }
}
```

## 👑 **Administrative Endpoints**

### **POST /admin/allow-user**
Adds user to allowed list.

**Request:**
```http
POST /admin/allow-user
Content-Type: application/json

{
  "userId": "5511999999999@s.whatsapp.net"
}
```

**Response:**
```json
{
  "message": "User 5511999999999@s.whatsapp.net added to allowed list"
}
```

### **DELETE /admin/allow-user/:userId**
Removes user from allowed list.

**Response:**
```json
{
  "message": "User 5511999999999@s.whatsapp.net removed from allowed list"
}
```

## 🚨 **Error Codes**

### **400 - Bad Request**
- Message not provided
- Empty or invalid content
- Size out of limits

### **422 - Unprocessable Entity**
- Unsupported media
- Invalid message format

### **429 - Too Many Requests**
- Rate limit exceeded
- Too many requests per minute

### **500 - Internal Server Error**
- Groq API error
- PDF generation failure
- Internal server problem

## 📋 **Data Formats**

### **Message Structure**
```json
{
  "role": "user|assistant",
  "content": "Message content",
  "messageType": "general|report|consultation|media",
  "timestamp": 1640995200000
}
```

### **Session Context**
```json
{
  "currentTopic": "marketing|sales|financial|operational|hr|strategy|technology|customer_service",
  "companyFocus": "Detected company name",
  "conversationType": "report|consultation|follow_up|media_not_supported",
  "reportHistory": [
    {
      "timestamp": 1640995200000,
      "topic": "marketing",
      "company": "Amazon"
    }
  ],
  "userPreferences": {}
}
```

### **Session Statistics**
```json
{
"messageCount": 5,
"sessionDuration": 300000,
"reportCount": 2,
"currentTopic": "marketing",
"companyFocus": "Amazon"
}
```

## 🔒 **Authentication and Security**

### **Rate Limiting**
- **Limit**: 10 requests per minute per user
- **Header**: Doesn't return rate limit headers
- **Reset**: 60-second sliding window

### **Validation**
- **Minimum size**: 2 characters
- **Maximum size**: 2000 characters
- **Encoding**: UTF-8 required
- **Sanitization**: Removes control characters

## 📝 **Usage Examples**

### **Business Analysis**
```bash
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{"message": "Analyze Tesla", "userId": "user123"}'
```

### **Consulting**
```bash
curl -X POST http://localhost:3001/analyze \
  -H "Content-Type: application/json" \
  -d '{"message": "How to improve sales?", "userId": "user123"}'
```

### **Check Session**
```bash
curl http://localhost:3001/session/user123
```

### **Reset Conversation**
```bash
curl -X DELETE http://localhost:3001/session/user123
```

### **Add Allowed User**
```bash
curl -X POST http://localhost:3001/admin/allow-user \
  -H "Content-Type: application/json" \
  -d '{"userId": "5511999999999@s.whatsapp.net"}'
```

## ⚙️ **Configuration**

### **Environment Variables**
```env
PORT=3001
GROQ_API_KEY=your_groq_key
GROQ_URL=https://api.groq.com/openai/v1/chat/completions
GROQ_MODEL=llama3-70b-8192
ANALYZE_API_URL=http://localhost:3001/analyze
```

### **Recommended Headers**
```http
Content-Type: application/json
User-Agent: YourApp/1.0
Accept: application/json
```

## 🚀 **Performance**

### **Timeouts**
- **Groq API**: ~5-10 seconds
- **PDF generation**: ~1-2 seconds
- **Validations**: <100ms

### **Limits**
- **Concurrent requests**: No specific limit
- **Payload size**: 2000 characters
- **Response size**: ~1024 AI tokens
