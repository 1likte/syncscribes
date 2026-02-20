'use client';

import { useState } from 'react';
import { Home, Search, PlusSquare, Heart, User, Plus, X, Book, Users, Star, Bell, MessageSquare, ChevronLeft, BookOpen, PlaySquare, Library, PenTool, Activity, Video } from 'lucide-react';
import CreatePost from './CreatePost';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();
    const { status } = useSession();
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

    const menuItems = [
        { icon: Home, label: 'Home', href: '/' },
        // Auth Logic: Separate Profile and Login
        ...(status === 'authenticated' ? [
            { icon: User, label: 'Profile', href: '/profile' }
        ] : [
            { icon: User, label: 'Sign In', href: '/auth/signin' }
        ]),
        { icon: MessageSquare, label: 'Messages', href: '/messages' },
        { icon: Users, label: 'Chat Rooms', href: '/chat-rooms' },
        { icon: PlaySquare, label: 'Browse', href: '/browse' },
        { icon: Video, label: 'SyncMeet', href: '/meet' },
        { icon: Library, label: 'My Library', href: '/collections' },
        {
            icon: PenTool,
            label: 'Create Post',
            onClick: () => setIsCreatePostOpen(true)
        },
        { icon: Activity, label: 'Community Feed', href: '/activity' },
    ];

    return (
        <>
            <aside className="fixed right-2 md:right-4 top-0 bottom-0 w-10 hidden md:flex flex-col items-center z-[120] bg-transparent pt-4 pointer-events-none">
                {/* Background Overlay for easier closing */}
                {isOpen && (
                    <div
                        className="fixed inset-0 z-[-1] pointer-events-auto"
                        onClick={() => setIsOpen(false)}
                    />
                )}

                {/* Navigation */}
                <nav className="flex flex-col items-center gap-8 relative z-10 mt-20 pointer-events-auto">

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex flex-col items-center gap-10"
                            >
                                {menuItems.map((item, index) => {
                                    const Icon = item.icon;
                                    const isActive = item.href ? pathname === item.href : false;

                                    return (
                                        <div key={index} className="relative group">
                                            {item.href ? (
                                                <Link
                                                    href={item.href}
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    <motion.div
                                                        whileHover={{ scale: 1.2, color: 'hsl(var(--foreground))' }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className={`p-2 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                                                    >
                                                        <Icon className="w-7 h-7" strokeWidth={isActive ? 2.5 : 2} />

                                                        <span className="absolute right-full mr-4 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none backdrop-blur-md">
                                                            {item.label}
                                                        </span>
                                                    </motion.div>
                                                </Link>
                                            ) : (
                                                <motion.div
                                                    whileHover={{ scale: 1.2, color: 'hsl(var(--foreground))' }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => {
                                                        item.onClick?.();
                                                        setIsOpen(false);
                                                    }}
                                                    className={`p-2 transition-colors cursor-pointer text-muted-foreground hover:text-white`}
                                                >
                                                    <Icon className="w-7 h-7" strokeWidth={2} />

                                                    <span className="absolute right-full mr-4 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none backdrop-blur-md">
                                                        {item.label}
                                                    </span>
                                                </motion.div>
                                            )}
                                        </div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </nav>
            </aside>

            {/* Create Post Modal */}
            <AnimatePresence>
                {isCreatePostOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 z-[130] backdrop-blur-sm flex items-center justify-center p-4"
                            onClick={() => setIsCreatePostOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100vw', y: '-50%', opacity: 0 }}
                            animate={{ x: '-50%', y: '-50%', opacity: 1 }}
                            exit={{ x: '100vw', y: '-50%', opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed z-[140] w-[90vw] max-w-[600px] h-[300px] flex items-center justify-center group"
                            style={{
                                top: '50%',
                                left: '50%'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Search Bar Style Neon Glow - Theme Aware */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-2xl opacity-40 group-hover:opacity-100 blur-md transition duration-500" />

                            {/* Modal Content */}
                            <div className="relative h-full w-full bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-2xl rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-2xl flex flex-col z-10">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-black italic bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-white/90 dark:to-white">
                                        CREATE POST
                                    </h2>
                                    <button
                                        onClick={() => setIsCreatePostOpen(false)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-muted rounded-full transition-colors text-slate-400 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-white"
                                        aria-label="Close"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex-1 min-h-0">
                                    <CreatePost onClose={() => setIsCreatePostOpen(false)} />
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

// Removed NavButton helper as it's no longer used in this simpler version
