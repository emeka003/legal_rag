'use client';
import { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import DashboardLayout from '@/components/DashboardLayout';
import type { ToolResult } from '@/lib/tools';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    citations?: ToolResult['citations'];
}

interface Conversation {
    id: string;
    title: string;
    updated_at: string;
}

export default function ChatPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedCitation, setSelectedCitation] = useState<NonNullable<Message['citations']>[0] | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch conversations on load
    useEffect(() => {
        fetch('/api/chat/history')
            .then((res) => res.json())
            .then((data) => {
                if (data.conversations?.length) {
                    setConversations(data.conversations);
                    setActiveConvId(data.conversations[0].id);
                }
            });
    }, []);

    // Fetch messages when active conversation changes
    useEffect(() => {
        if (!activeConvId) {
            setMessages([]);
            return;
        }

        fetch(`/api/chat/${activeConvId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.messages) {
                // Parse citations
                const parsed = data.messages.map((m: { citations: string | ToolResult['citations']; [key: string]: unknown }) => ({
                    ...m,
                    citations: typeof m.citations === 'string' ? JSON.parse(m.citations) : m.citations,
                }));
                    setMessages(parsed);
                }
            });
    }, [activeConvId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput('');
        setLoading(true);

        // Optimistic update
        const tempId = Date.now().toString();
        setMessages((prev) => [...prev, { id: tempId, role: 'user', content: userMsg }]);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId: activeConvId, message: userMsg }),
            });

            const data = await res.json();

            if (data.conversationId) {
                if (data.conversationId !== activeConvId) {
                    setActiveConvId(data.conversationId);
                    // Refresh conversation list for new title
                    fetch('/api/chat/history')
                        .then((res) => res.json())
                        .then((d) => setConversations(d.conversations));
                }

                // Replace optimistic message with real one + AI response
                setMessages((prev) => [
                    ...prev.filter((m) => m.id !== tempId),
                    { id: tempId, role: 'user', content: userMsg }, // keep user msg
                    {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: data.answer,
                        citations: data.citations,
                    },
                ]);
            }
        } catch {
            // Revert optimistic update on error (simplified)
            alert('Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    const startNewChat = () => {
        setActiveConvId(null);
        setMessages([]);
        setInput('');
    };

    return (
        <DashboardLayout>
            <div className="chat-layout">
                <aside className="chat-sidebar">
                    <div className="chat-sidebar-header">
                        <button onClick={startNewChat} className="btn btn-primary w-full">
                            + New Chat
                        </button>
                    </div>
                    <div className="chat-sidebar-list">
                        {conversations.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setActiveConvId(c.id)}
                                className={`chat-sidebar-item ${activeConvId === c.id ? 'active' : ''}`}
                            >
                                <div className="chat-sidebar-item-text">{c.title || 'Untitled Chat'}</div>
                            </button>
                        ))}
                    </div>
                </aside>

                <section className="chat-main">
                    {messages.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">⚖️</div>
                            <h2>Legal AI Assistant</h2>
                            <p>Ask questions about your uploaded contracts, regulations, or case files.</p>
                        </div>
                    ) : (
                        <div className="chat-messages">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`chat-message ${msg.role}`}>
                                    <div className={`chat-avatar ${msg.role === 'user' ? 'user-avatar' : 'ai-avatar'}`}>
                                        {msg.role === 'user' ? 'U' : 'AI'}
                                    </div>
                                    <div className="chat-bubble">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                                            <div className="chat-citations">
                                                {msg.citations.map((cit, i) => (
                                                    <div
                                                        key={i}
                                                        className="citation-tag"
                                                        onClick={() => setSelectedCitation(cit)}
                                                    >
                                                        Source: {cit.documentName} ({Math.round(cit.similarity * 100)}%)
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="chat-message assistant">
                                    <div className="chat-avatar ai-avatar">AI</div>
                                    <div className="chat-bubble">
                                        <div className="loading-dots">
                                            <span></span><span></span><span></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    <div className="chat-input-area">
                        <form onSubmit={handleSend} className="chat-input-wrapper">
                            <textarea
                                className="input chat-input"
                                placeholder="Ask a legal question..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend(e);
                                    }
                                }}
                            />
                            <button type="submit" className="btn btn-primary chat-send-btn" disabled={loading || !input.trim()}>
                                ➜
                            </button>
                        </form>
                    </div>
                </section>

                {selectedCitation && (
                    <aside className="citations-panel">
                        <div className="flex justify-between items-center mb-4">
                            <h3>Source Context</h3>
                            <button onClick={() => setSelectedCitation(null)} className="text-sm text-gray-500 hover:text-white">✕</button>
                        </div>
                        <div className="citation-card" style={{ border: '1px solid var(--accent)' }}>
                            <div className="citation-card-header">
                                <span className="citation-card-source">{selectedCitation.documentName}</span>
                                <span className="citation-card-score">Relevance: {Math.round(selectedCitation.similarity * 100)}%</span>
                            </div>
                            <div className="citation-card-text">
                                {selectedCitation.chunkContent}...
                            </div>
                            <div className="mt-2 text-xs text-gray-400">Section {selectedCitation.chunkIndex}</div>
                        </div>
                    </aside>
                )}
            </div>
        </DashboardLayout>
    );
}
