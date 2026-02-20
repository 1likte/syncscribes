'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Image, Video, Link2, Calendar } from 'lucide-react';

interface SharePost {
    id: string;
    type: string;
    title?: string | null;
    content: string;
    imageUrl?: string | null;
    videoUrl?: string | null;
    linkUrl?: string | null;
    createdAt: string;
}

const typeIcons: Record<string, typeof FileText> = {
    TEXT: FileText,
    IMAGE: Image,
    VIDEO: Video,
    LINK: Link2,
};

export default function BlogPage() {
    const [posts, setPosts] = useState<SharePost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/shares')
            .then((res) => res.json())
            .then((data) => {
                setPosts(Array.isArray(data) ? data : []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen pt-20 pb-24 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-24">
            <div className="max-w-2xl mx-auto px-4">
                <div className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight">
                        Paylaşım <span className="text-primary">Yeri</span>
                    </h1>
                    <p className="text-foreground/50 text-sm mt-2 font-medium">
                        Video, yazı, link ve görseller
                    </p>
                </div>

                {posts.length === 0 ? (
                    <div className="text-center py-20 text-foreground/40">
                        <FileText size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="font-bold uppercase tracking-widest text-sm">Henüz paylaşım yok</p>
                        <p className="text-xs mt-2">Yakında içerik eklenecek.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {posts.map((post, idx) => (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-foreground/[0.02] dark:bg-white/[0.02] rounded-2xl border border-foreground/5 p-6 md:p-8"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        {(() => {
                                            const Icon = typeIcons[post.type] || FileText;
                                            return <Icon size={24} className="text-primary" />;
                                        })()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {post.title && (
                                            <h2 className="text-xl font-black text-foreground mb-2">
                                                {post.title}
                                            </h2>
                                        )}
                                        <div className="flex items-center gap-2 text-foreground/40 text-xs mb-3">
                                            <Calendar size={14} />
                                            <span>
                                                {new Date(post.createdAt).toLocaleDateString('tr-TR', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>

                                        {post.type === 'IMAGE' && post.imageUrl && (
                                            <div className="mb-4 rounded-xl overflow-hidden">
                                                <img
                                                    src={post.imageUrl}
                                                    alt={post.title || 'Görsel'}
                                                    className="w-full max-h-96 object-cover"
                                                />
                                            </div>
                                        )}

                                        {post.type === 'VIDEO' && post.videoUrl && (
                                            <div className="mb-4 rounded-xl overflow-hidden aspect-video bg-black/20">
                                                <iframe
                                                    src={
                                                        post.videoUrl.includes('youtube.com/embed')
                                                            ? post.videoUrl
                                                            : post.videoUrl.includes('youtu.be/')
                                                            ? `https://www.youtube.com/embed/${post.videoUrl.split('youtu.be/')[1]?.split('?')[0] || ''}`
                                                            : post.videoUrl.replace('watch?v=', 'embed/')
                                                    }
                                                    title={post.title || 'Video'}
                                                    className="w-full h-full"
                                                    allowFullScreen
                                                />
                                            </div>
                                        )}

                                        {post.type === 'LINK' && post.linkUrl && (
                                            <a
                                                href={post.linkUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-4 hover:underline"
                                            >
                                                <Link2 size={16} />
                                                {post.linkUrl}
                                            </a>
                                        )}

                                        <div className="prose prose-invert max-w-none text-foreground/90 whitespace-pre-wrap">
                                            {post.content}
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
