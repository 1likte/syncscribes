'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User } from 'lucide-react';

interface Message {
    id: string;
    senderId: string; // 'me' or other userId
    content: string;
    createdAt: Date;
}

interface ChatWindowProps {
    recipientId: string;
}

export default function ChatWindow({ recipientId }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll to bottom on new message
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Optimistic update
        const tempMsg: Message = {
            id: Date.now().toString(),
            senderId: 'me', // TODO: Get actual current user ID
            content: newMessage,
            createdAt: new Date(),
        };
        setMessages(prev => [...prev, tempMsg]);
        setNewMessage('');

        // TODO: Send to API
        /*
        await fetch('/api/messages', {
            method: 'POST',
            body: JSON.stringify({ recipientId, content: newMessage })
        });
        */
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-950">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center space-x-3 bg-slate-900/50">
                <div className="bg-slate-700 p-2 rounded-full text-white">
                    <User className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white">User {recipientId}</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isMe = msg.senderId === 'me';
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-slate-800 text-slate-200 rounded-bl-none'
                                    }`}
                            >
                                <p>{msg.content}</p>
                                <div className={`text-xs mt-1 opacity-70 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                    {msg.createdAt.toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-900/30">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-800 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
