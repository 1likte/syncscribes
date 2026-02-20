import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Eye, BookOpen, Star, Zap, Bell, Plus, X, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePaywall } from '@/hooks/usePaywall';

interface FeedCardProps {
    book: {
        id: string;
        title: string;
        coverImage: string;
        author: string;
        category: string;
        rating: number;
        views?: number;
        reads?: number;
    };
}

export default function FeedCard({ book }: FeedCardProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const { triggerPaywall, isSubscribed } = usePaywall();

    const handlePremiumAction = (action: string) => {
        if (!isSubscribed) {
            triggerPaywall(10); // Require subscription for deep analysis/vipsync
            return;
        }
        // Proceed with premium action logic here
        console.log("Premium Action:", action);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-foreground/[0.03] dark:bg-white/[0.03] light:bg-black/[0.03] backdrop-blur-xl rounded-[3rem] mb-8 overflow-hidden shadow-sm transition-all duration-500 group"
        >
            {/* Glow Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            {/* Post Header */}
            <div className="p-6 flex items-center justify-between relative z-20">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-purple-600 to-pink-500 overflow-hidden p-[1.5px] shadow-lg shadow-primary/10">
                        <div className="w-full h-full bg-background rounded-[14px] flex items-center justify-center text-xs font-black text-foreground">
                            {book.author.substring(0, 2).toUpperCase()}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-foreground tracking-tight flex items-center gap-1.5 leading-none">
                            {book.author}
                            <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
                            <span className="text-[10px] text-primary uppercase tracking-widest font-black">Elite Hub</span>
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5 text-foreground/40 leading-none">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em]">Intel Log</p>
                            <span>•</span>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1">
                                <Star size={10} className="fill-primary text-primary" /> {book.rating || 4.5}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <AnimatePresence>
                        {showActions && (
                            <motion.div
                                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                                className="flex items-center gap-2 mr-2"
                            >
                                <button onClick={() => handlePremiumAction('transmit')} className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-xl hover:scale-110 active:scale-95 transition-all shadow-sm">
                                    <Zap size={18} fill="currentColor" />
                                </button>
                                <button onClick={() => handlePremiumAction('notify')} className="w-10 h-10 flex items-center justify-center bg-purple-500/10 text-purple-500 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-sm">
                                    <Bell size={18} />
                                </button>
                                <button onClick={() => handlePremiumAction('protocol')} className="w-10 h-10 flex items-center justify-center bg-foreground/5 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-sm">
                                    <Plus size={18} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={() => setShowActions(!showActions)}
                        className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all ${showActions ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-foreground/5 text-foreground/40 hover:text-primary hover:bg-primary/5'}`}
                    >
                        {showActions ? <X size={20} /> : <MoreHorizontal size={20} />}
                    </button>
                </div>
            </div>

            {/* Premium Action Overlay Hint */}
            <AnimatePresence>
                {showActions && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-primary/[0.02] backdrop-blur-[2px] z-10 pointer-events-none"
                    />
                )}
            </AnimatePresence>

            {/* Post Content */}
            <div className="px-7 pb-6 pt-2">
                <p className="text-[15px] leading-relaxed text-foreground/70 font-medium">
                    Analysis Sequence: Reviewing <span className="text-primary font-black uppercase tracking-tight">#{book.title}</span>. Found deep correlation with <span className="text-purple-400 font-bold">{book.category}</span> data structures.
                </p>
            </div>

            {/* Book Display - Visual Core */}
            <div className="px-4 pb-4">
                <Link href={`/books/${book.id}`} className="block relative group/book group-hover:scale-[1.01] transition-transform duration-500">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-[2.2rem] blur-lg opacity-0 group-hover/book:opacity-100 transition-opacity" />
                    <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden bg-zinc-900 shadow-xl border-none">
                        <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                            <div className="flex-1 min-w-0">
                                <span className="px-3 py-1 bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-lg mb-3 inline-block shadow-lg">Deep Analysis</span>
                                <h4 className="text-2xl font-black text-white tracking-widest truncate uppercase drop-shadow-2xl">{book.title}</h4>
                                <div className="flex items-center gap-5 mt-2">
                                    <div className="flex items-center gap-1.5 text-white/60 text-[10px] font-black uppercase tracking-widest leading-none">
                                        <Eye size={12} className="text-primary" /> {book.views || 120}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-white/60 text-[10px] font-black uppercase tracking-widest leading-none">
                                        <BookOpen size={12} className="text-purple-500" /> {book.reads || 45}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.preventDefault(); setIsSaved(!isSaved); }}
                                className={`flex-shrink-0 w-16 h-16 rounded-[1.5rem] backdrop-blur-xl flex items-center justify-center transition-all shadow-2xl ${isSaved ? 'bg-primary text-white shadow-primary/30 scale-110' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            >
                                <Bookmark size={28} className={isSaved ? 'fill-current' : ''} />
                            </button>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Engagement Hud */}
            <div className="px-7 py-4 flex justify-between text-[11px] text-foreground/30 font-black uppercase tracking-[0.3em] bg-foreground/[0.01]">
                <div className="flex items-center gap-6">
                    <span className="hover:text-primary transition-colors cursor-pointer">42 Syncs</span>
                    <span className="hover:text-primary transition-colors cursor-pointer">18 Intel</span>
                </div>
                <div className="flex items-center gap-2 text-primary">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]" />
                    Protocol Live
                </div>
            </div>

            {/* Action Bar */}
            <div className="px-4 pb-4">
                <div className="flex items-center gap-2 p-2.5 bg-foreground/[0.03] hover:bg-foreground/[0.05] rounded-[2.5rem] transition-all shadow-sm">
                    <button
                        onClick={() => setIsLiked(!isLiked)}
                        className={`flex-1 flex items-center justify-center gap-3 py-3.5 rounded-full group/btn transition-all ${isLiked ? 'bg-red-500/10 text-red-500 shadow-sm' : 'hover:bg-primary/5 text-foreground/40'}`}
                    >
                        <Heart size={22} className={isLiked ? 'fill-current' : 'group-hover/btn:text-primary transition-colors'} />
                        <span className={`text-[12px] font-black uppercase tracking-widest ${isLiked ? 'text-red-500' : 'group-hover/btn:text-foreground'}`}>Relate</span>
                    </button>
                    <div className="w-px h-8 bg-foreground/10" />
                    <button className="flex-1 flex items-center justify-center gap-3 py-3.5 hover:bg-primary/5 rounded-full group/btn transition-all">
                        <MessageCircle size={22} className="text-foreground/40 group-hover/btn:text-primary transition-colors" />
                        <span className="text-[12px] font-black uppercase tracking-widest text-foreground/40 group-hover/btn:text-foreground">Discuss</span>
                    </button>
                    <button
                        onClick={() => handlePremiumAction('share')}
                        className="w-14 h-14 flex items-center justify-center bg-foreground/5 rounded-full hover:bg-primary/5 hover:text-primary transition-all text-foreground/40"
                    >
                        <Share2 size={22} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
