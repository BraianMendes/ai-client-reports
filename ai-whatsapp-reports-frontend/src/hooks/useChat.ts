import { useState, useCallback } from 'react';
import { Message } from '@/types';
import { useApi } from './useApi';
import { generateId } from '@/utils/helpers';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: generateId(),
      role: "assistant", 
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { execute } = useApi<{ report?: string; error?: string }>();

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await execute('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ message: content.trim() })
      });

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: response.report || response.error || "Error generating response.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error while fetching AI response:", error);
      
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [execute]);

  const clearChat = useCallback(() => {
    setMessages([{
      id: generateId(),
      role: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date().toISOString()
    }]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat
  };
};
