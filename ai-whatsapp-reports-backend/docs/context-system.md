# 🧠 Conversation Context System

## 🎯 **Context Features**

### **Smart Memory**
- Maintains history of the last 10 messages
- Automatically detects companies, topics and conversation type
- Sessions with 30-minute timeout
- Automatic cleanup of expired sessions

### **Automatic Detection**
- **Companies**: Amazon, Tesla, Microsoft, etc.
- **Topics**: Marketing, sales, financial, operational
- **Type**: Report, consulting, follow-up
- **Context**: References to previous conversations

## 🔄 **How It Works**

### **Contextual Conversation Example**
```
1st: "Analyze Amazon"
    → Detects: Company=Amazon, Type=report
    → Response: Complete Amazon report

2nd: "What about their marketing?"
    → Context: Company=Amazon (previous)
    → Response: Specific analysis of Amazon's marketing

3rd: "How to apply this to my company?"
    → Context: Amazon + marketing + application
    → Response: Recommendations based on previous context
```

## 🎯 **Smart Detection**

### **Company Patterns**
```javascript
"Amazon"                    → Amazon
"Analyze Tesla"            → Tesla
"ABC Company Ltd"          → ABC Ltd
"Microsoft Report"         → Microsoft
"XYZ Client Inc."          → XYZ Inc.
```

### **Advanced Filters**
```javascript
excludeWords = ['about', 'how', 'where', 'when', 'why', 
               'who', 'what', 'make', 'generate', 'create']

"How to do marketing" → Does NOT detect "How" as company ✅
"Amazon" → Detects "Amazon" as company ✅
```

### **Recognized Topics**
- **Marketing**: advertising, promotion, branding, brand
- **Sales**: commercial, revenue, billing, customer
- **Financial**: finance, accounting, profit, costs
- **Operational**: operations, production, logistics, process
- **HR**: human resources, team, training
- **Strategy**: planning, growth, expansion, market
- **Technology**: IT, digital, software, automation
- **Customer Service**: support, customer care, experience, satisfaction

## 📊 **Session Structure**

```javascript
{
  userId: "5511999999999@s.whatsapp.net",
  messages: [
    { role: "user", content: "Amazon", timestamp: Date.now() },
    { role: "assistant", content: "Report...", timestamp: Date.now() }
  ],
  context: {
    currentTopic: "marketing",
    companyFocus: "Amazon",
    conversationType: "report",
    reportHistory: [{ timestamp, topic, company }]
  },
  sessionStart: Date.now(),
  lastActivity: Date.now()
}
```

## 🔧 **Settings**

```javascript
SESSION_TIMEOUT = 30 * 60 * 1000;
MAX_CONTEXT_MESSAGES = 10;
MAX_MESSAGE_LENGTH = 2000;
```

## 📈 **Conversation Types**

### **1. Report**
- Detected when: company mentioned, words like "analyze", "report"
- Response: Complete structured report
- Example: "Amazon" → Amazon Report

### **2. Consultation**
- Detected when: questions (?), words like "how", "what"
- Response: Educational consulting
- Example: "How to improve sales?" → Sales guidance

### **3. Follow-up**
- Detected when: second message or more
- Response: Based on previous context
- Example: "What about their marketing?" → Context from previous company

## 🎯 **Context in Prompt**

The system automatically injects into the AI prompt:

```
**CONVERSATION CONTEXT:**
User: Analyze Amazon...
Assistant: *BUSINESS ANALYSIS REPORT*...

**COMPANY IN FOCUS:** Amazon
**CURRENT TOPIC:** marketing
**CONVERSATION TYPE:** follow_up
**PREVIOUS REPORTS:** 2 reports generated in this session
```

## 📊 **Session Statistics**

### **Available Metrics**
```javascript
{
messageCount: 5,
sessionDuration: 180000,
reportCount: 2,
currentTopic: "marketing",
companyFocus: "Amazon"
}
```

### **Query Endpoints**
```http
GET /session/{userId}
GET /conversation/{userId}
DELETE /session/{userId}
```

## ⚡ **Performance**

- **Fast detection**: Optimized regex patterns
- **Efficient memory**: Message limit per context
- **Automatic cleanup**: Removes expired sessions
- **Smart contextualization**: Only last 3 messages in prompt

## 🔮 **Advanced Capabilities**

### **Contextual Reference**
The AI automatically connects information:
- "What about their marketing?" → Knows "their" = previous company
- "How to apply this?" → Refers to discussed topic/company
- "Can you detail more?" → Expands the last addressed topic

### **Report History**
Keeps record of generated reports to avoid repetitions and allow comparisons between previous analyses.
