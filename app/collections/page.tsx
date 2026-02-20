'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Book, Compass, Clock, Star, Heart, Play,
    Trash2, ChevronRight, BookOpen, Layers, Bookmark
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface BookCollection {
    id: string;
    page: number;
    isSaved: boolean;
    isLiked: boolean;
    updatedAt: string;
    book: {
        id: string;
        title: string;
        coverImage: string;
        reads: number;
        author: {
            username: string;
        };
    };
}

export default function CollectionsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [collections, setCollections] = useState<BookCollection[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCollections = async () => {
        try {
            const res = await fetch('/api/collections');
            if (res.ok) {
                const data = await res.json();
                setCollections(data.collections);
                setStats(data.statistics);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (session) fetchCollections();
        else setIsLoading(false);
    }, [session]);

    const removeFromCollection = async (bookId: string) => {
        try {
            await fetch('/api/books/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookId,
                    isSaved: false,
                    isLiked: false,
                    page: 1 // Reset to start if removed
                })
            });
            fetchCollections();
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!session) {
        return (
            <div className="min-h-screen pt-24 flex flex-col items-center justify-center text-center px-6">
                <LockIcon className="mb-6" />
                <h1 className="text-4xl font-black mb-4 uppercase">Login Required</h1>
                <p className="max-w-md text-slate-500 mb-8 font-bold">Please log in to see your personalized book collections and reading progress.</p>
                <Link href="/auth/signin" className="px-10 py-4 bg-primary text-white rounded-full font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                    Sign In Now
                </Link>
            </div>
        );
    }

    const readingList = collections.filter(c => c.page > 1);
    const savedList = collections.filter(c => c.isSaved);
    const favoritesList = collections.filter(c => c.isLiked);

    const hasContent = collections.length > 0;

    return (
        <div className="min-h-screen pt-24 pb-12 bg-transparent text-slate-900 dark:text-white transition-colors duration-500">
            <div className="container mx-auto px-6 max-w-7xl">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 md:mb-16"
                >
                    <div className="flex items-center gap-4 mb-2">
                        <span className="h-1 w-8 md:w-12 bg-primary rounded-full" />
                        <span className="text-primary font-bold tracking-widest text-[10px] md:text-sm uppercase">Member Library</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic text-slate-900 dark:text-white uppercase leading-none">
                        YOUR <span className="text-primary">COLLECTIONS</span>
                    </h1>
                </motion.div>

                {!hasContent ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-20">

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            <StatCard title="Reading" count={stats?.readingCount || 0} icon={Compass} color="blue" />
                            <StatCard title="Saved" count={stats?.savedCount || 0} icon={Bookmark} color="cyan" />
                            <StatCard title="Favorites" count={stats?.likedCount || 0} icon={Heart} color="red" />
                            <StatCard title="Total Books" count={stats?.totalBooks || 0} icon={BookOpen} color="purple" />
                        </div>

                        {/* Continue Reading Section */}
                        {readingList.length > 0 && (
                            <CollectionSection
                                title="CONTINUE READING"
                                icon={<Clock className="w-6 h-6 text-blue-400" />}
                                books={readingList}
                                onRemove={removeFromCollection}
                                type="reading"
                            />
                        )}

                        {/* Saved Section */}
                        {savedList.length > 0 && (
                            <CollectionSection
                                title="SAVED FOR LATER"
                                icon={<Bookmark className="w-6 h-6 text-cyan-400 fill-cyan-400" />}
                                books={savedList}
                                onRemove={removeFromCollection}
                                type="saved"
                            />
                        )}

                        {/* Favorites Section */}
                        {favoritesList.length > 0 && (
                            <CollectionSection
                                title="MY FAVORITES"
                                icon={<Heart className="w-6 h-6 text-rose-500 fill-rose-500" />}
                                books={favoritesList}
                                onRemove={removeFromCollection}
                                type="favorite"
                            />
                        )}

                    </div>
                )}
            </div>
        </div>
    );
}

function CollectionSection({ title, icon, books, onRemove, type }: any) {
    return (
        <section className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3">
                <div className="shrink-0">{icon}</div>
                <h2 className="text-xl md:text-3xl font-black tracking-tight italic uppercase">{title}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                {books.map((c: any) => (
                    <CollectionBookCard
                        key={c.id}
                        data={c}
                        onRemove={() => onRemove(c.book.id)}
                        type={type}
                    />
                ))}
            </div>
        </section>
    );
}

function CollectionBookCard({ data, type, onRemove }: { data: BookCollection, type: string, onRemove: () => void }) {
    const router = useRouter();
    const book = data.book;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -8 }}
            className="group relative"
        >
            <div className="aspect-[2/3] rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-white/5 shadow-2xl bg-slate-100 dark:bg-white/5 relative">
                <img
                    src={book.coverImage || '/api/placeholder/400/600'}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-40"
                />

                {/* Overlay Controls */}
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={() => router.push(`/read/${book.id}`)}
                        className="w-16 h-16 bg-white text-black rounded-full shadow-[0_0_30px_rgba(255,255,255,0.5)] flex items-center justify-center mb-4 active:scale-90 transition-all hover:bg-primary hover:text-white"
                    >
                        <Play className="w-8 h-8 fill-current ml-1" />
                    </button>
                    <span className="text-xs font-black uppercase tracking-widest text-white drop-shadow-lg">
                        {type === 'reading' ? 'Resume' : 'Read Now'}
                    </span>

                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="absolute top-4 right-4 w-10 h-10 bg-black/60 hover:bg-red-500 text-white rounded-2xl flex items-center justify-center backdrop-blur-md transition-all border border-white/10"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Reading Progress indicator */}
                {data.page > 1 && (
                    <div className="absolute bottom-4 left-4 right-4 h-1.5 bg-black/30 rounded-full overflow-hidden">
                        <div className="h-full bg-primary shadow-[0_0_15px_rgba(255,45,117,0.8)]" style={{ width: '45%' }} />
                    </div>
                )}
            </div>

            <div className="mt-4 px-2">
                <h3 className="font-black text-sm truncate group-hover:text-primary transition-colors">{book.title}</h3>
                <p className="text-[10px] text-slate-500 dark:text-white/40 font-black uppercase tracking-[0.2em] mt-1">{book.author.username}</p>
            </div>
        </motion.div>
    );
}

function StatCard({ title, count, icon: Icon, color }: any) {
    const colors: any = {
        blue: 'from-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        cyan: 'from-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
        red: 'from-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        purple: 'from-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    };

    return (
        <div className={`p-4 md:p-6 rounded-[24px] md:rounded-[32px] bg-gradient-to-br ${colors[color]} border backdrop-blur-md shadow-xl`}>
            <Icon className="w-5 h-5 md:w-6 md:h-6 mb-2 md:mb-4" />
            <div className="text-2xl md:text-4xl font-black mb-1">{count}</div>
            <div className="text-[9px] md:text-[10px] uppercase font-black tracking-widest opacity-60">{title}</div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="relative group max-w-5xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-[56px] opacity-20 dark:opacity-30 group-hover:opacity-100 blur-2xl transition duration-700" />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative py-16 md:py-32 text-center bg-white/90 dark:bg-neutral-950/90 backdrop-blur-3xl rounded-[32px] md:rounded-[56px] border border-slate-200 dark:border-white/5 overflow-hidden z-10 shadow-3xl"
            >
                <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 border border-slate-200 dark:border-white/10">
                    <BookOpen className="w-8 h-8 md:w-12 md:h-12 text-primary animate-pulse" />
                </div>
                <h3 className="text-2xl md:text-4xl font-black mb-4 uppercase px-4">Your library is silent.</h3>
                <p className="text-slate-500 dark:text-white/50 max-w-md mx-auto mb-8 md:mb-10 text-sm md:text-lg px-6 font-bold leading-relaxed">
                    Explore our vast collection of stories and start building your personal sanctuary of knowledge.
                </p>
                <Link href="/browse" className="relative inline-flex items-center gap-3 bg-primary text-white px-8 md:px-12 py-4 md:py-5 rounded-full font-black uppercase tracking-widest hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-primary/20 text-xs md:text-sm">
                    Discover Books <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
            </motion.div>
        </div>
    );
}

function LockIcon({ className }: any) {
    return (
        <div className={`w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center ${className}`}>
            <Star className="w-10 h-10 text-primary" />
        </div>
    );
}
