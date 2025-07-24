"use client";
import { useState, useRef, useEffect } from "react";
import { Button, Input } from "@heroui/react";
import { Send, User, Bot, Trash2 } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useNotification } from "@/hooks/useNotification";
import Loading from "@/components/Loading";
import Notification from "@/components/Notification";
import Card from "@/components/Card";

export default function ChatScreen() {
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    
    const { messages, isLoading, sendMessage, clearChat } = useChat();
    const { notification, showNotification, hideNotification } = useNotification();

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        const messageContent = input.trim();
        setInput("");
        
        try {
            await sendMessage(messageContent);
        } catch {
            showNotification('error', 'Failed to send message. Please try again.');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClearChat = () => {
        clearChat();
        showNotification('success', 'Chat cleared successfully!');
    };

    return (
        <div className="min-h-screen w-full bg-black flex flex-col p-4 md:p-8">
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={hideNotification}
                />
            )}
            
            <div className="w-full max-w-4xl mx-auto flex flex-col flex-1 mt-16">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-white">AI Chat</h1>
                    <Button
                        onClick={handleClearChat}
                        variant="bordered"
                        className="text-red-400 border-red-400 hover:bg-red-400/10"
                        startContent={<Trash2 className="w-4 h-4" />}
                    >
                        Clear Chat
                    </Button>
                </div>

                <Card className="flex-1 flex flex-col p-0 overflow-hidden">
                    <div
                        ref={messagesContainerRef}
                        className="flex-1 overflow-y-auto p-6 space-y-4"
                        style={{ maxHeight: "60vh" }}
                    >
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex items-start gap-3 ${
                                    message.role === "user" ? "flex-row-reverse" : ""
                                }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        message.role === "user"
                                            ? "bg-blue-600"
                                            : "bg-neutral-700"
                                    }`}
                                >
                                    {message.role === "user" ? (
                                        <User className="w-4 h-4 text-white" />
                                    ) : (
                                        <Bot className="w-4 h-4 text-white" />
                                    )}
                                </div>
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl ${
                                        message.role === "user"
                                            ? "bg-blue-600 text-white"
                                            : "bg-neutral-800 text-neutral-100"
                                    }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">
                                        {message.content}
                                    </p>
                                    {message.timestamp && (
                                        <p className="text-xs opacity-70 mt-1">
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-neutral-800 p-3 rounded-2xl">
                                    <Loading size="sm" label="AI is thinking..." />
                                </div>
                            </div>
                        )}
                        
                        <div ref={bottomRef} />
                    </div>

                    <div className="border-t border-neutral-800 p-4">
                        <div className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message here..."
                                className="flex-1"
                                variant="bordered"
                                classNames={{
                                    input: "text-white",
                                    inputWrapper: "bg-neutral-900 border-neutral-700 hover:border-neutral-600"
                                }}
                                disabled={isLoading}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4"
                                isIconOnly
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
