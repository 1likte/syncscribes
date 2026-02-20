'use client';

import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

interface Conversation {
    id: string; // User ID of the other person
    username: string;
    avatar: string | null;
    lastMessage: string;
    lastMessageAt: Date;
}

interface ConversationListProps {
    onSelectUser: (userId: string) => void;
    selectedUserId: string | null;
}

export default function ConversationList({ onSelectUser, selectedUserId }: ConversationListProps) {
    // Mock data for now - in real app, fetch from API
    const [conversations, setConversations] = useState<Conversation[]>([
        {
            id: 'mock-user-1',
            username: 'alice',
            avatar: null,
            lastMessage: 'Hey, did you read the new book?',
            lastMessageAt: new Date(),
        },
        {
            id: 'mock-user-2',
            username: 'bob',
            avatar: null,
            lastMessage: 'The PDF reader is awesome!',
            lastMessageAt: new Date(Date.now() - 3600000),
        }
    ]);

    return (
        <div className="w-80 border-r border-slate-800 bg-slate-950 flex flex-col">
            <div className="p-4 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.map((conv) => (
                    <div
                        key={conv.id}
                        onClick={() => onSelectUser(conv.id)}
                        className={`p-4 cursor-pointer hover:bg-slate-900 transition-colors ${selectedUserId === conv.id ? 'bg-slate-900 border-l-4 border-blue-500' : ''
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="bg-slate-800 p-2 rounded-full text-slate-400">
                                <User className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-semibold text-white truncate">{conv.username}</h3>
                                    <span className="text-xs text-slate-500">
                                        {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 truncate">{conv.lastMessage}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
