'use client';

import { Feed } from '@/components/feed/Feed';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Book {
    id: string
    title: string
    coverImage?: string
    author: {
        username: string
    } | string
}

export default function ActivityPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [newestBooks, setNewestBooks] = useState<Book[]>([]);

    useEffect(() => {
        const fetchNewBooks = async () => {
            try {
                const res = await fetch('/api/books?limit=8&preview=true');
                const data = await res.json();
                setNewestBooks(Array.isArray(data) ? data : (data.books || []));
            } catch (error) {
                console.error('Error fetching new books:', error);
            }
        };
        fetchNewBooks();
    }, []);

    return (
        <div className="min-h-screen pt-16 pb-12 bg-background relative z-10">
            <div className="max-w-[600px] mx-auto px-2 md:px-0">


                {/* 2. System Feeds (Formerly Stories) - EN ÜSTTE (Yani Post Box'ın Hemen Altında) */}
                <div className="px-1 pt-2 pb-6">
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-2">
                        <motion.div
                            whileTap={{ scale: 0.95 }}
                            className="relative flex-shrink-0 w-32 h-44 rounded-[2.5rem] overflow-hidden bg-foreground/[0.03] dark:bg-white/[0.03] light:bg-black/[0.03] group cursor-pointer transition-all hover:bg-primary/[0.05] shadow-sm"
                        >
                            <div className="h-[70%] w-full bg-foreground/[0.05] flex items-center justify-center overflow-hidden">
                                {session?.user?.image ? (
                                    <img src={session.user.image} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-500" />
                                ) : (
                                    <div className="w-full h-full bg-primary/10" />
                                )}
                            </div>
                            <div className="absolute inset-x-0 bottom-0 h-[35%] bg-background/80 backdrop-blur-md p-2 flex flex-col items-center justify-end">
                                <div className="absolute top-0 -translate-y-1/2 p-2.5 bg-primary rounded-2xl border-[3px] border-background text-white shadow-xl shadow-primary/30">
                                    <Plus size={18} strokeWidth={3} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 group-hover:text-primary transition-colors">INITIATE</span>
                            </div>
                        </motion.div>

                        {newestBooks.map((book) => (
                            <motion.div
                                key={book.id}
                                whileTap={{ scale: 0.95 }}
                                className="relative flex-shrink-0 w-32 h-44 rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-sm"
                            >
                                <img src={book.coverImage || '/api/placeholder/300/450'} className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/80" />
                                <div className="absolute top-4 left-4 w-9 h-9 rounded-xl border border-white/20 backdrop-blur-md overflow-hidden bg-white/10 flex items-center justify-center text-[11px] font-black text-white shadow-lg">
                                    {(typeof book.author === 'string' ? book.author : book.author.username).substring(0, 2).toUpperCase()}
                                </div>
                                <div className="absolute bottom-4 left-4 right-4 text-center">
                                    <p className="text-[10px] font-black text-white/90 leading-tight truncate uppercase tracking-widest">
                                        {typeof book.author === 'string' ? book.author : book.author.username}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* 3. Intelligence Feed Header */}
                <div className="px-1 mb-6 flex items-center justify-between">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-foreground/40 drop-shadow-sm px-2">Intelligence Feed</h2>
                    <div className="flex items-center gap-2.5 bg-primary/10 px-3 py-1.5 rounded-full shadow-sm border-none mr-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]" />
                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Global Pulse</span>
                    </div>
                </div>

                {/* 4. Feed Component */}
                <Feed />
            </div>
        </div>
    );
}
