'use client';

import {
    Home,
    Video,
    Menu,
    Search,
    BookOpen,
    Sun,
    Moon,
    Settings,
    User,
    LogOut,
    X,
    Activity,
    Compass,
    Shield,
    HelpCircle,
    Info,
    FileText,
    Cookie,
    MessageSquare,
    Users,
    PlaySquare,
    Library,
    PenTool,
    Plus
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useState, useEffect, useMemo } from 'react';
import { signOut, useSession } from 'next-auth/react';

// Shared Particle Component for Header & Footer
const ParticleEffect = ({ count = 15, className = "" }: { count?: number; className?: string }) => {
    const particles = useMemo(() =>
        Array.from({ length: count }).map((_, i) => ({
            id: i,
            size: Math.random() * 6 + 3,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            duration: Math.random() * 10 + 7,
            delay: Math.random() * 5,
            opacity: Math.random() * 0.6 + 0.3
        })), [count]
    );

    return (
        <div className={`absolute inset-0 pointer-events-none z-0 ${className}`} style={{ maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)' }}>
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: [0, p.opacity, 0],
                        scale: [1, 1.8, 1],
                        x: [0, Math.random() * 80 - 40, 0],
                        y: [0, Math.random() * 80 - 40, 0]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "linear"
                    }}
                    className="absolute bg-primary/50 rounded-full blur-[4px]"
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

export default function MobileNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { data: session, status } = useSession();
    const [mounted, setMounted] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    const navItems = [
        { icon: Home, path: '/', label: 'Base', color: 'text-cyan-400', glow: 'bg-cyan-400/30' },
        { icon: Video, path: '/meet', label: 'MEET', color: 'text-pink-500', glow: 'bg-pink-500/30' },
        { icon: BookOpen, path: '/browse', label: 'BOOKS', color: 'text-purple-500', glow: 'bg-purple-500/30' },
        { icon: Activity, path: '/activity', label: 'PULSE', color: 'text-sky-400', glow: 'bg-sky-400/30' },
    ];

    // EXACT WEB SIDEBAR BUTTONS
    const expandIcons = [
        { icon: Home, label: 'Home', path: '/' },
        ...(status === 'authenticated' ? [
            { icon: User, label: 'Profile', path: '/profile' }
        ] : [
            { icon: User, label: 'Sign In', path: '/auth/signin' }
        ]),
        { icon: MessageSquare, label: 'Messages', path: '/messages' },
        { icon: Users, label: 'Chat Rooms', path: '/chat-rooms' },
        { icon: PlaySquare, label: 'Browse', path: '/browse' },
        { icon: Video, label: 'SyncMeet', path: '/meet' },
        { icon: Library, label: 'My Library', path: '/collections' },
        { icon: PenTool, label: 'Create Post', path: '/activity' }, // Linking to activity for post creation on mobile
        { icon: Activity, label: 'Community Feed', path: '/activity' },
    ];

    const handleNavigate = (path: string) => {
        setIsMenuOpen(false);
        setShowSearch(false);
        router.push(path);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            handleNavigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <>
            {/* Top Header */}
            <nav className="fixed top-0 left-0 right-0 z-[120] bg-transparent h-16 flex items-center justify-between px-6 transition-all">
                <div className="absolute inset-x-0 -bottom-20 -top-20 pointer-events-none">
                    <ParticleEffect count={12} />
                </div>

                {/* Outside Click Backdrop */}
                <AnimatePresence>
                    {showSearch && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSearch(false)}
                            className="fixed inset-0 z-[-1] bg-black/20 backdrop-blur-[2px] h-screen w-screen left-0 top-0"
                            style={{ position: 'fixed', height: '100vh', width: '100vw' }}
                        />
                    )}
                </AnimatePresence>

                <div className="flex items-center justify-between w-full relative z-[130]">
                    {/* Logo Section - Fades out slightly when searching for more space */}
                    <div className={`transition-all duration-500 ${showSearch ? 'opacity-0 scale-95 pointer-events-none w-0 h-0 overflow-hidden' : 'opacity-100 scale-100'}`}>
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative w-8 h-8 flex items-center justify-center"
                            >
                                <img src="/images/icon.png" alt="S" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.4)]" />
                            </motion.div>
                            <span className="text-lg font-black tracking-tighter bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]">
                                SyncScribes
                            </span>
                        </Link>
                    </div>

                    {/* Search & Actions Container */}
                    <div className={`flex items-center gap-3 transition-all duration-500 ${showSearch ? 'flex-1' : ''}`}>
                        <AnimatePresence>
                            {showSearch && (
                                <motion.form
                                    initial={{ opacity: 0, x: 20, width: 0 }}
                                    animate={{ opacity: 1, x: 0, width: '100%' }}
                                    exit={{ opacity: 0, x: 20, width: 0 }}
                                    onSubmit={handleSearch}
                                    className="flex-1 flex items-center bg-foreground/[0.03] dark:bg-white/5 backdrop-blur-2xl rounded-2xl px-4 py-2 border border-slate-200 dark:border-white/10"
                                >
                                    <input
                                        autoFocus
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search..."
                                        className="w-full bg-transparent border-none text-foreground font-bold outline-none placeholder:text-foreground/30 text-sm"
                                    />
                                    <button type="submit" className="text-primary p-1">
                                        <Search size={16} />
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center gap-3">
                            {!showSearch && (
                                <button
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className="w-10 h-10 flex items-center justify-center bg-transparent rounded-full hover:bg-foreground/5 transition-all text-foreground border-none shadow-none"
                                >
                                    {mounted && (theme === 'dark' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-slate-800" />)}
                                </button>
                            )}
                            <button
                                onClick={() => setShowSearch(!showSearch)}
                                className={`w-10 h-10 flex items-center justify-center rounded-full active:scale-90 transition-all border-none z-[140] shadow-none ${showSearch ? 'bg-foreground/5 text-foreground' : 'text-primary'}`}
                            >
                                {showSearch ? <X size={20} /> : <Search size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Floating Icons (Roll-up Animation) */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/5 dark:bg-black/20 backdrop-blur-[2px] z-[130]"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="fixed bottom-24 right-5 z-[140] flex flex-col items-center gap-3 py-4"
                        >
                            {expandIcons.map((item, idx) => (
                                <motion.button
                                    key={item.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: (expandIcons.length - 1 - idx) * 0.02 }}
                                    onClick={() => handleNavigate(item.path)}
                                    className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-3xl text-foreground/70 active:text-primary active:bg-primary/20 transition-all group relative border border-white/10 shadow-xl"
                                >
                                    <item.icon size={20} />
                                    <span className="absolute right-14 px-3 py-1 bg-background/90 text-[10px] font-black uppercase tracking-widest text-foreground opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none whitespace-nowrap border border-foreground/5 shadow-xl">
                                        {item.label}
                                    </span>
                                </motion.button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Bottom Tab Bar - Seamless Floating Buttons */}
            <nav className="fixed bottom-0 left-0 right-0 z-[110] bg-transparent h-20 sm:hidden flex items-center justify-around px-4 pb-safe">
                <div className="absolute inset-x-0 -bottom-20 -top-20 pointer-events-none opacity-30">
                    <ParticleEffect count={12} />
                </div>

                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;
                    return (
                        <Link key={item.path} href={item.path} className="relative flex flex-col items-center justify-center w-full h-full py-4 z-10">
                            <motion.div
                                whileTap={{ scale: 0.85 }}
                                whileHover={{ scale: 1.05 }}
                                className="flex flex-col items-center gap-1.5"
                            >
                                <div className="relative">
                                    {/* Enhanced Neon Glow Effect */}
                                    {isActive && (
                                        <>
                                            <motion.div
                                                layoutId="neonGlow"
                                                className={`absolute -inset-6 rounded-full blur-[30px] opacity-70 ${item.glow}`}
                                                animate={{
                                                    scale: [1, 1.3, 1],
                                                    opacity: [0.5, 0.8, 0.5]
                                                }}
                                                transition={{
                                                    duration: 2.5,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            />
                                            <motion.div
                                                className={`absolute -inset-4 rounded-full blur-[18px] ${item.glow}`}
                                                animate={{
                                                    scale: [1, 1.15, 1],
                                                    opacity: [0.7, 1, 0.7]
                                                }}
                                                transition={{
                                                    duration: 1.8,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            />
                                        </>
                                    )}
                                    <motion.div
                                        animate={isActive ? {
                                            y: [0, -3, 0],
                                        } : {}}
                                        transition={{
                                            duration: 2.2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <Icon
                                            size={24}
                                            strokeWidth={isActive ? 3 : 2}
                                            className={`transition-all duration-300 relative z-10 ${isActive ? item.color : 'text-foreground/40'}`}
                                            style={isActive ? { 
                                                filter: 'drop-shadow(0 0 14px currentColor) drop-shadow(0 0 6px currentColor)',
                                            } : {}}
                                        />
                                    </motion.div>
                                </div>
                                {/* Label - Only for active */}
                                {isActive && (
                                    <motion.span 
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${item.color}`}
                                        style={{ 
                                            textShadow: '0 0 10px currentColor',
                                        }}
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </motion.div>
                        </Link>
                    );
                })}

                {/* Grid Button - Seamless with neon effect when active */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="relative flex items-center justify-center w-full h-full bg-transparent border-none z-10 py-4"
                >
                    <motion.div
                        whileTap={{ scale: 0.85 }}
                        whileHover={{ scale: 1.05 }}
                        className="flex flex-col items-center gap-1.5"
                    >
                        <div className="relative">
                            {isMenuOpen && (
                                <>
                                    <motion.div
                                        className="absolute -inset-6 rounded-full blur-[30px] opacity-70 bg-primary/30"
                                        animate={{
                                            scale: [1, 1.3, 1],
                                            opacity: [0.5, 0.8, 0.5]
                                        }}
                                        transition={{
                                            duration: 2.5,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                    <motion.div
                                        className="absolute -inset-4 rounded-full blur-[18px] bg-primary/30"
                                        animate={{
                                            scale: [1, 1.15, 1],
                                            opacity: [0.7, 1, 0.7]
                                        }}
                                        transition={{
                                            duration: 1.8,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    />
                                </>
                            )}
                            <motion.div
                                animate={isMenuOpen ? {
                                    y: [0, -3, 0],
                                } : {}}
                                transition={{
                                    duration: 2.2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <Menu 
                                    size={24} 
                                    strokeWidth={isMenuOpen ? 3 : 2} 
                                    className={`transition-all duration-300 relative z-10 ${isMenuOpen ? 'text-primary' : 'text-foreground/40'}`}
                                    style={isMenuOpen ? { 
                                        filter: 'drop-shadow(0 0 14px currentColor) drop-shadow(0 0 6px currentColor)',
                                    } : {}}
                                />
                            </motion.div>
                        </div>
                        {isMenuOpen && (
                            <motion.span 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[9px] font-black uppercase tracking-wider text-primary"
                                style={{ 
                                    textShadow: '0 0 10px currentColor',
                                }}
                            >
                                MENU
                            </motion.span>
                        )}
                    </motion.div>
                </button>
            </nav>

            <div className="h-16 w-full" />
        </>
    );
}
