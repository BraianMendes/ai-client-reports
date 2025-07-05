"use client";
import { useState, useRef, useEffect } from "react";
import {
    Card, CardHeader, CardBody,
    Button, Spinner
} from "@heroui/react";
import { Send, User, Bot } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function ChatScreen() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I'm your AI assistant. How can I help you today?" }
    ]);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages, loading]);

    async function handleSend() {
        if (!input.trim()) return;
        const userMessage: Message = { role: "user", content: input.trim() };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input.trim() }),
            });
            const data = await res.json();
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.report || data.error || "Erro ao gerar resposta." }
            ]);
        } catch (err) {
            console.error("Error while fetching AI response:", err);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Connection error with the server. Please try again later." }
            ]);
        }
        setLoading(false);
    }

    function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") handleSend();
    }

    return (
        <main className="min-h-screen w-full flex flex-col items-center justify-center bg-[#101010] px-2">
            <Card className="w-full max-w-3xl mt-14 mb-10 flex flex-col rounded-t-2xl rounded-b-3xl shadow-xl bg-neutral-900">
                <CardHeader className="px-6 pt-2 pb-2 border-b border-neutral-800 flex flex-col items-start">
                    <h1 className="text-2xl font-bold text-white">AI Chat</h1>
                    <p className="text-neutral-400 text-sm mt-0">
                        Interactive chat with your AI assistant
                    </p>
                </CardHeader>
                <CardBody className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[60vh]">
                    <div ref={messagesContainerRef} className="flex flex-col space-y-4">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {msg.role === "assistant" && (
                                    <span className="mr-3 flex items-center justify-center rounded-full bg-blue-900 w-8 h-8">
                                        <Bot size={20} className="text-blue-300" />
                                    </span>
                                )}
                                <div
                                    className={`rounded-xl px-4 py-2 text-base whitespace-pre-line max-w-[70%]
                                    ${msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-br-sm"
                                        : "bg-neutral-800 text-neutral-100 rounded-bl-sm"
                                    }`}
                                >
                                    {msg.content}
                                </div>
                                {msg.role === "user" && (
                                    <span className="ml-3 flex items-center justify-center rounded-full bg-neutral-700 w-8 h-8">
                                        <User size={20} className="text-neutral-300" />
                                    </span>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start items-center">
                                <span className="mr-3 flex items-center justify-center rounded-full bg-blue-900 w-8 h-8">
                                    <Bot size={20} className="text-blue-300" />
                                </span>
                                <div className="rounded-xl px-4 py-2 bg-neutral-800 text-neutral-400 flex items-center">
                                    <Spinner size="sm" className="mr-2" /> Generating response...
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>
                </CardBody>
                <form
                    className="flex gap-2 px-6 py-4 border-t border-neutral-800 bg-neutral-900 sticky bottom-0 rounded-b-3xl"
                    onSubmit={e => { e.preventDefault(); handleSend(); }}
                >
                    <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 bg-neutral-800 border border-neutral-700 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/40 text-white rounded-xl outline-none shadow-none transition-all px-4 py-2"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                        disabled={loading}
                        autoFocus
                    />
                    <Button
                        type="submit"
                        size="lg"
                        className="flex gap-2 items-center px-5 py-2 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-150 border-2 border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        disabled={loading || !input.trim()}
                        variant="solid"
                    >
                        <Send size={18} />
                        Send
                    </Button>
                </form>
            </Card>
        </main>
    );
}
