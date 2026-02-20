'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { usePaywall } from '@/hooks/usePaywall';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Hash, Video, Phone, MoreVertical, Send, Smile, Paperclip, Mic, UserPlus, Flag, MessageSquare, ArrowLeft, Trash2 } from 'lucide-react';

// Shared Particle Component for Background
const ParticleEffect = ({ count = 12 }: { count?: number }) => {
    const particles = useMemo(() =>
        Array.from({ length: count }).map((_, i) => ({
            id: i,
            size: Math.random() * 5 + 3,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            duration: Math.random() * 15 + 15,
            delay: Math.random() * 7
        })), [count]
    );

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: [0.1, 0.3, 0.1],
                        scale: [1, 1.5, 1],
                        x: [0, Math.random() * 100 - 50, 0],
                        y: [0, Math.random() * 100 - 50, 0]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeInOut"
                    }}
                    className="absolute bg-primary/40 rounded-full blur-[3px]"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: p.left,
                        top: p.top,
                    }}
                />
            ))}
        </div>
    );
};

export default function ChatPage() {
    const { status } = useSession();
    const { triggerPaywall, isSubscribed } = usePaywall();
    const [activeChat, setActiveChat] = useState<number | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    const [chats, setChats] = useState([
        { id: 1, name: 'Alice Freeman', lastMessage: 'Hey! Did you read the new chapter?', time: '10:30 AM', avatar: 'bg-purple-500', unread: 2, status: 'online' },
        { id: 2, name: 'Book Club Group', lastMessage: 'Meeting is rescheduled to Friday.', time: 'Yesterday', avatar: 'bg-blue-500', unread: 0, status: 'offline' },
        { id: 3, name: 'John Doe', lastMessage: 'Thanks for the recommendation!', time: 'Tue', avatar: 'bg-green-500', unread: 0, status: 'online' },
    ]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (status !== 'loading' && !isSubscribed) {
            triggerPaywall(5);
        }
    }, [status, isSubscribed, triggerPaywall]);

    const messages = [
        { id: 1, sender: 'them', text: 'Hey! Did you read the new chapter?', time: '10:30 AM' },
        { id: 2, sender: 'me', text: 'Not yet! I was planning to read it tonight.', time: '10:32 AM' },
        { id: 3, sender: 'them', text: 'Oh you are in for a treat! The plot twist is insane.', time: '10:33 AM' },
        { id: 4, sender: 'me', text: 'No spoilers please! 🙈', time: '10:33 AM' },
    ];

    const deleteChat = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this conversation?')) {
            setChats(prev => prev.filter(chat => chat.id !== id));
            if (activeChat === id) setActiveChat(null);
        }
    };

    return (
        <div className="min-h-screen pt-20 md:pt-24 pb-12 bg-transparent flex justify-center px-0 md:px-4 relative overflow-hidden">
            <ParticleEffect count={15} />

            <div className="relative w-full max-w-6xl h-[calc(100vh-80px)] md:h-[85vh] group z-10">
                {/* Neon Glow Outer */}
                <div className="hidden md:block absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-[32px] opacity-20 dark:opacity-30 group-hover:opacity-60 blur-xl transition duration-700" />

                <div className="relative w-full h-full bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-3xl md:rounded-[32px] overflow-hidden flex shadow-2xl border-t md:border border-slate-200 dark:border-white/5">

                    {/* Sidebar / Chat List */}
                    <div className={`${isMobile && activeChat ? 'hidden' : 'flex'} w-full md:w-80 border-r border-slate-200 dark:border-white/5 flex-col bg-slate-50/30 dark:bg-black/40`}>
                        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Messages</h2>
                                <button className="p-2 hover:bg-slate-200 dark:hover:bg-white/5 rounded-full transition-colors">
                                    <UserPlus className="w-5 h-5 text-primary" />
                                </button>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full bg-slate-200/50 dark:bg-white/5 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary/50 text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-1 md:space-y-2">
                            <AnimatePresence>
                                {chats.map((chat) => (
                                    <motion.div
                                        key={chat.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setActiveChat(chat.id)}
                                        className={`p-3 md:p-4 rounded-2xl cursor-pointer transition-all group/item relative ${activeChat === chat.id ? 'bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30' : 'hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'}`}
                                    >
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${chat.avatar} flex items-center justify-center text-white font-bold relative shrink-0`}>
                                                {chat.name[0]}
                                                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 border-white dark:border-black ${chat.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-0.5">
                                                    <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm md:text-base group-hover/item:text-primary transition-colors">{chat.name}</h3>
                                                    <span className="text-[10px] md:text-xs text-slate-400 dark:text-muted-foreground">{chat.time}</span>
                                                </div>
                                                <p className="text-xs md:text-sm text-slate-500 dark:text-muted-foreground truncate">{chat.lastMessage}</p>
                                            </div>

                                            <button
                                                onClick={(e) => deleteChat(e, chat.id)}
                                                className="opacity-0 group-hover/item:opacity-100 p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>

                                            {chat.unread > 0 && !activeChat && (
                                                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] text-white font-bold group-hover/item:hidden">
                                                    {chat.unread}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {chats.length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-muted-foreground text-sm italic">No active chats.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`${isMobile && !activeChat ? 'hidden' : 'flex'} flex-1 flex-col bg-white/50 dark:bg-transparent`}>
                        {activeChat ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-3 md:p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between backdrop-blur-md bg-white/40 dark:bg-black/20">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        {isMobile && (
                                            <button
                                                onClick={() => setActiveChat(null)}
                                                className="p-2 -ml-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"
                                            >
                                                <ArrowLeft className="w-5 h-5" />
                                            </button>
                                        )}
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                                            {chats.find(c => c.id === activeChat)?.name[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-sm md:text-base">{chats.find(c => c.id === activeChat)?.name}</h3>
                                            <span className="text-[10px] md:text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                Online
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 md:gap-2">
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400 dark:text-muted-foreground">
                                            <Phone className="w-4 h-4 md:w-5 md:h-5" />
                                        </button>
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400 dark:text-muted-foreground">
                                            <Video className="w-4 h-4 md:w-5 md:h-5" />
                                        </button>
                                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-red-400">
                                            <Flag className="w-4 h-4 md:w-5 md:h-5" />
                                        </button>
                                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground">
                                            <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-slate-50/20 dark:bg-transparent">
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] md:max-w-[70%] p-3 md:p-4 rounded-3xl ${msg.sender === 'me'
                                                ? 'bg-primary text-white font-medium rounded-br-none shadow-lg shadow-primary/20'
                                                : 'bg-white/90 dark:bg-white/10 text-slate-900 dark:text-white rounded-bl-none shadow-sm border border-slate-200 dark:border-white/5'
                                                }`}>
                                                <p className="text-xs md:text-sm">{msg.text}</p>
                                                <span className={`text-[9px] md:text-[10px] block mt-1 opacity-70 ${msg.sender === 'me' ? 'text-right text-white/80' : 'text-left text-slate-400 dark:text-white/50'}`}>
                                                    {msg.time}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Input Area */}
                                <div className="p-3 md:p-4 border-t border-slate-200 dark:border-white/5 bg-white/60 dark:bg-black/40 backdrop-blur-md">
                                    <div className="flex items-center gap-1 md:gap-2">
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400 dark:text-muted-foreground">
                                            <Paperclip className="w-5 h-5" />
                                        </button>
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                placeholder="Message..."
                                                className="w-full bg-slate-200/50 dark:bg-white/5 border-none rounded-full py-2.5 md:py-3 pl-4 pr-10 text-xs md:text-sm focus:ring-1 focus:ring-primary/50 text-slate-900 dark:text-white"
                                            />
                                            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full text-slate-400 dark:text-muted-foreground">
                                                <Smile className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400 dark:text-muted-foreground hidden md:block">
                                            <Mic className="w-5 h-5" />
                                        </button>
                                        <button className="p-2.5 md:p-3 bg-primary rounded-full hover:opacity-90 transition-opacity text-primary-foreground shadow-lg shadow-primary/20 flex-shrink-0">
                                            <Send className="w-4 h-4 md:w-5 md:h-5 ml-0.5" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-black text-foreground mb-2 italic">SYNCSCRIBES CHAT</h2>
                                <p className="text-muted-foreground max-w-sm text-sm md:text-base px-4">
                                    Select a voyager to start your journey through the ink.
                                </p>
                                <button className="mt-8 px-6 py-2.5 bg-primary text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                    <UserPlus className="w-4 h-4" />
                                    FIND VOYAGERS
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
