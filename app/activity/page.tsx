'use client';

import { Feed } from '@/components/feed/feed';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Plus, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Book {
    id: string
    title: string
    coverImage?: string
    author: { username: string } | string
}

interface Story {
    id: string
    imageUrl: string
    text?: string | null
    createdAt: string
    user: { id: string; username: string; avatar?: string | null }
}

export default function ActivityPage() {
    const { data: session } = useSession();
    const [newestBooks, setNewestBooks] = useState<Book[]>([]);
    const [stories, setStories] = useState<Story[]>([]);
    const [showStoryModal, setShowStoryModal] = useState(false);
    const [storyImage, setStoryImage] = useState<File | null>(null);
    const [storyText, setStoryText] = useState('');
    const [storySubmitting, setStorySubmitting] = useState(false);

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

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const res = await fetch('/api/stories');
                const data = await res.json();
                setStories(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching stories:', error);
            }
        };
        fetchStories();
    }, []);

    const handleShareStory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!storyImage || !session?.user?.id) return;
        setStorySubmitting(true);
        try {
            const fd = new FormData();
            fd.append('file', storyImage);
            fd.append('type', 'cover');
            const up = await fetch('/api/upload', { method: 'POST', body: fd });
            if (!up.ok) throw new Error('Image upload failed');
            const { url } = await up.json();
            const res = await fetch('/api/stories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl: url, text: storyText || null }),
            });
            if (!res.ok) throw new Error('Failed to post story');
            const newStory = await res.json();
            setStories((prev) => [newStory, ...prev]);
            setShowStoryModal(false);
            setStoryImage(null);
            setStoryText('');
        } catch (err: any) {
            alert(err.message || 'Failed to share story');
        } finally {
            setStorySubmitting(false);
        }
    };

    return (
        <div className="min-h-screen pt-14 md:pt-16 pb-12 bg-background relative z-10">
            <div className="max-w-[600px] mx-auto px-2 md:px-0">

                {/* Stories row */}
                <div className="px-1 pt-1 pb-4 md:pt-2 md:pb-6">
                    <div className="flex gap-3 md:gap-4 overflow-x-auto pb-3 md:pb-4 no-scrollbar px-2">
                        <motion.div
                            whileTap={{ scale: 0.95 }}
                            onClick={() => session && setShowStoryModal(true)}
                            className="relative flex-shrink-0 w-28 h-40 md:w-32 md:h-44 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-foreground/[0.03] dark:bg-white/[0.03] group cursor-pointer transition-all hover:bg-primary/[0.05] shadow-sm"
                        >
                            <div className="h-[70%] w-full bg-foreground/[0.05] flex items-center justify-center overflow-hidden">
                                {session?.user?.image ? (
                                    <img src={session.user.image} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-500" alt="" />
                                ) : (
                                    <div className="w-full h-full bg-primary/10" />
                                )}
                            </div>
                            <div className="absolute inset-x-0 bottom-0 h-[35%] bg-background/80 backdrop-blur-md p-2 flex flex-col items-center justify-end">
                                <div className="absolute top-0 -translate-y-1/2 p-2 md:p-2.5 bg-primary rounded-2xl border-[3px] border-background text-white shadow-xl shadow-primary/30">
                                    <Plus size={16} strokeWidth={3} className="md:w-[18px] md:h-[18px]" />
                                </div>
                                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 group-hover:text-primary transition-colors">Share story</span>
                            </div>
                        </motion.div>

                        {stories.map((story) => (
                            <motion.div
                                key={story.id}
                                whileTap={{ scale: 0.95 }}
                                className="relative flex-shrink-0 w-28 h-40 md:w-32 md:h-44 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-sm"
                            >
                                <img src={story.imageUrl} alt="" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/80" />
                                <div className="absolute top-3 left-3 w-8 h-8 rounded-xl border border-white/20 backdrop-blur-md overflow-hidden bg-white/10 flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                                    {(story.user?.username || 'U').substring(0, 2).toUpperCase()}
                                </div>
                                <div className="absolute bottom-3 left-3 right-3 text-center">
                                    <p className="text-[9px] font-black text-white/90 leading-tight truncate uppercase tracking-widest">
                                        {story.user?.username || 'User'}
                                    </p>
                                </div>
                            </motion.div>
                        ))}

                        {newestBooks.map((book) => (
                            <motion.div
                                key={book.id}
                                whileTap={{ scale: 0.95 }}
                                className="relative flex-shrink-0 w-28 h-40 md:w-32 md:h-44 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-sm"
                            >
                                <img src={book.coverImage || '/api/placeholder/300/450'} className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/80" />
                                <div className="absolute top-3 left-3 md:top-4 md:left-4 w-8 h-8 md:w-9 md:h-9 rounded-xl border border-white/20 backdrop-blur-md overflow-hidden bg-white/10 flex items-center justify-center text-[10px] md:text-[11px] font-black text-white shadow-lg">
                                    {(typeof book.author === 'string' ? book.author : book.author.username).substring(0, 2).toUpperCase()}
                                </div>
                                <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4 text-center">
                                    <p className="text-[9px] md:text-[10px] font-black text-white/90 leading-tight truncate uppercase tracking-widest">
                                        {typeof book.author === 'string' ? book.author : book.author.username}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Share story modal */}
                <AnimatePresence>
                    {showStoryModal && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => !storySubmitting && setShowStoryModal(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-background border border-foreground/10 rounded-2xl shadow-2xl z-50 p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-black text-foreground">Share story</h3>
                                    <button onClick={() => !storySubmitting && setShowStoryModal(false)} className="p-2 rounded-lg hover:bg-foreground/5">
                                        <X size={20} />
                                    </button>
                                </div>
                                {!session ? (
                                    <p className="text-foreground/60 text-sm">Sign in to share a story.</p>
                                ) : (
                                    <form onSubmit={handleShareStory} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-foreground/60 mb-2">Image *</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                required
                                                onChange={(e) => setStoryImage(e.target.files?.[0] || null)}
                                                className="w-full text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-foreground/60 mb-2">Caption (optional)</label>
                                            <input
                                                type="text"
                                                value={storyText}
                                                onChange={(e) => setStoryText(e.target.value)}
                                                placeholder="Add a caption..."
                                                className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-transparent text-foreground"
                                                maxLength={150}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={storySubmitting || !storyImage}
                                            className="w-full py-3 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {storySubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                                            Share story
                                        </button>
                                    </form>
                                )}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Intelligence Feed Header */}
                <div className="px-1 mb-4 md:mb-6 flex items-center justify-between">
                    <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-foreground/40 drop-shadow-sm px-2">Intelligence Feed</h2>
                    <div className="flex items-center gap-2 md:gap-2.5 bg-primary/10 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full shadow-sm border-none mr-2">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]" />
                        <span className="text-[8px] md:text-[9px] font-black text-primary uppercase tracking-[0.2em]">Global Pulse</span>
                    </div>
                </div>

                {/* 4. Feed Component */}
                <Feed />
            </div>
        </div>
    );
}
