'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Image as ImageIcon, Video, Link as LinkIcon, Palette, Type, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { usePosts } from '@/contexts/PostsContext';
import { usePaywall } from '@/hooks/usePaywall';


interface CreatePostProps {
    onClose?: () => void;
}

export default function CreatePost({ onClose }: CreatePostProps) {
    const { data: session } = useSession();
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedFont, setSelectedFont] = useState('font-sans');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showFontPicker, setShowFontPicker] = useState(false);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [linkUrl, setLinkUrl] = useState('');
    const [showLinkInput, setShowLinkInput] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { addPost } = usePosts();
    const { triggerPaywall, isSubscribed } = usePaywall();

    const fonts = [

        { name: 'Sans', value: 'font-sans' },
        { name: 'Serif', value: 'font-serif' },
        { name: 'Mono', value: 'font-mono' },
        { name: 'Cursive', value: 'font-cursive' }, // Ensure these classes exist or map to styles
    ];

    const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899'];

    const [mediaPreview, setMediaPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMediaFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isSubscribed) {
            triggerPaywall();
            return;
        }

        if (!content.trim() && !mediaFile) return;

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content,
                    image: mediaPreview,
                    color: selectedColor,
                    font: selectedFont,
                    link: linkUrl || undefined,
                }),
            });

            if (response.ok) {
                const newPost = await response.json();

                // Add post to local context for immediate feedback
                // We ensure author info is present from the session or API response
                const user = session?.user as any;
                addPost({
                    ...newPost,
                    author: newPost.author || {
                        username: user?.username || user?.name || 'Unknown',
                        avatar: user?.image || user?.avatar || undefined,
                        level: user?.level || 1
                    }
                });

                // Reset form
                setContent('');
                setMediaFile(null);
                setMediaPreview(null);
                setLinkUrl('');
                setSelectedColor('');
                setSelectedFont('font-sans');
                router.refresh();
                onClose?.();
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to share insight');
            }
        } catch (error) {
            console.error('Post submission error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full h-auto">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {/* Main Input Area - Compact */}
                <div className="relative bg-slate-50 dark:bg-black/40 rounded-2xl p-3 md:p-4 border border-slate-200 dark:border-white/10 focus-within:border-primary/50 transition-colors">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind?"
                        className={`w-full min-h-[70px] md:min-h-[100px] bg-transparent resize-none focus:outline-none text-sm md:text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 ${selectedFont}`}
                        style={selectedColor ? { color: selectedColor } : undefined}
                        disabled={isSubmitting}
                    />

                    {/* Media Preview - Compact Overlay */}
                    {mediaFile && (
                        <div className="absolute bottom-3 left-3 right-3 bg-white/95 dark:bg-black/90 rounded-xl p-2 flex items-center gap-3 shadow-2xl border border-slate-200 dark:border-white/10 z-20">
                            {mediaPreview ? (
                                <img src={mediaPreview} className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-white/10" alt="Preview" />
                            ) : (
                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                    <ImageIcon className="w-4 h-4 text-slate-400" />
                                </div>
                            )}
                            <span className="flex-1 text-[10px] text-slate-600 dark:text-white truncate font-bold">{mediaFile.name}</span>
                            <button
                                type="button"
                                onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                                className="p-1 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 rounded-md transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Toolbar - Compact row */}
                <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
                    <div className="flex items-center gap-0.5 min-w-0">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/*,video/*"
                        />

                        <ToolbarBtn icon={ImageIcon} onClick={() => fileInputRef.current?.click()} label="Image" />
                        <ToolbarBtn icon={Video} onClick={() => fileInputRef.current?.click()} label="Video" />

                        {/* Link Dropdown */}
                        <div className="relative">
                            <ToolbarBtn
                                icon={LinkIcon}
                                onClick={() => {
                                    setShowLinkInput(!showLinkInput);
                                    setShowColorPicker(false);
                                    setShowFontPicker(false);
                                }}
                                active={showLinkInput}
                                label="Link"
                            />
                            <AnimatePresence>
                                {showLinkInput && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute bottom-full left-0 mb-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2 shadow-2xl w-[220px] md:w-[250px]"
                                    >
                                        <input
                                            type="text"
                                            value={linkUrl}
                                            onChange={(e) => setLinkUrl(e.target.value)}
                                            placeholder="Paste link here..."
                                            className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary/50"
                                            autoFocus
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="hidden xs:block w-px h-4 bg-slate-200 dark:bg-white/10 mx-1" />

                        {/* Color Dropdown */}
                        <div className="relative">
                            <ToolbarBtn
                                icon={Palette}
                                onClick={() => {
                                    setShowColorPicker(!showColorPicker);
                                    setShowLinkInput(false);
                                    setShowFontPicker(false);
                                }}
                                active={showColorPicker}
                                label="Color"
                            />
                            <AnimatePresence>
                                {showColorPicker && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute bottom-full left-0 mb-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-2 shadow-2xl grid grid-cols-6 gap-2"
                                    >
                                        {colors.map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => { setSelectedColor(c); setShowColorPicker(false); }}
                                                className={`w-6 h-6 rounded-full border border-black/10 transition-transform hover:scale-110 ${selectedColor === c ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900 scale-110' : ''}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Font Dropdown */}
                        <div className="relative">
                            <ToolbarBtn
                                icon={Type}
                                onClick={() => {
                                    setShowFontPicker(!showFontPicker);
                                    setShowLinkInput(false);
                                    setShowColorPicker(false);
                                }}
                                active={showFontPicker}
                                label="Font"
                            />
                            <AnimatePresence>
                                {showFontPicker && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute bottom-full left-0 mb-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-1.5 shadow-2xl flex flex-col gap-1 min-w-[120px]"
                                    >
                                        {fonts.map(f => (
                                            <button
                                                key={f.value}
                                                type="button"
                                                onClick={() => { setSelectedFont(f.value); setShowFontPicker(false); }}
                                                className={`px-3 py-1.5 rounded-lg text-left text-xs transition-colors ${selectedFont === f.value ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                                            >
                                                <span className={f.value}>{f.name}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!content.trim() && !mediaFile || isSubmitting}
                        className="bg-primary text-white p-2.5 md:p-3 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 shrink-0"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send className="w-4 h-4 md:w-5 md:h-5" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

function ToolbarBtn({ icon: Icon, onClick, active, label }: any) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`p-2.5 rounded-lg transition-all duration-200 group relative ${active ? 'bg-primary/10 dark:bg-primary/20 text-primary' : 'text-slate-400 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted hover:text-slate-900 dark:hover:text-white'}`}
            title={label}
        >
            <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
        </button>
    );
}
