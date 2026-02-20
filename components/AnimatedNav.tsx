'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Search, Bell, User, Menu, X, Sun, Moon, Plus } from 'lucide-react';
import { usePaywall } from '@/hooks/usePaywall';
import { useMemo } from 'react';

interface AnimatedNavProps {
  isSidebarOpen?: boolean;
  onSidebarToggle?: () => void;
}

// Integrated Particle Component
const ParticleEffect = ({ count = 15 }: { count?: number }) => {
  const particles = useMemo(() =>
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: Math.random() * 5 + 2,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.4 + 0.1
    })), [count]
  );

  return (
    <div className="absolute inset-x-0 -top-20 -bottom-20 pointer-events-none z-0" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)' }}>
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
          className="absolute bg-primary/40 rounded-full blur-[4px]"
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

export default function AnimatedNav({ isSidebarOpen, onSidebarToggle }: AnimatedNavProps) {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Scroll tracking for show/hide logic
  const { scrollY } = useScroll();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { triggerPaywall, isSubscribed } = usePaywall();

  useMotionValueEvent(scrollY, "change", (latest) => {

    const direction = latest > lastScrollY ? "down" : "up";
    if (latest < 50) {
      setIsVisible(true);
    } else if (direction === "down" && isVisible) {
      setIsVisible(false);
    } else if (direction === "up" && !isVisible) {
      setIsVisible(true);
    }
    setLastScrollY(latest);
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const shouldShowButtons = status === 'unauthenticated';
  const isLoading = status === 'loading';

  return (
    <nav className="fixed top-0 left-0 right-0 z-[110] bg-transparent border-none shadow-none pointer-events-none h-20">
      <div className="absolute inset-0 pointer-events-none">
        <ParticleEffect count={15} />
      </div>
      <div className="w-full h-full px-4 pointer-events-none">
        <div className="flex items-center justify-between h-full relative pointer-events-none">

          {/* Left - App Identity - SyncScribes */}
          <motion.div
            animate={{
              opacity: isVisible ? 1 : 0,
              x: isVisible ? 0 : -20,
              pointerEvents: isVisible ? "auto" : "none"
            }}
            transition={{ duration: 0.3 }}
            className="md:pl-6 flex items-center justify-start z-[120] pointer-events-auto"
          >
            <Link href="/" className="flex items-center gap-3">
              <motion.div
                className="relative cursor-pointer group flex items-center gap-3"
                whileHover={{
                  scale: 1.05,
                  rotate: [0, -2, 2, -2, 0],
                  transition: { duration: 0.4, ease: "easeInOut" }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute -inset-2 bg-primary/40 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                <img
                  src="/images/icon.png"
                  alt="SyncScribes Logo"
                  className="w-10 h-10 md:w-12 md:h-12 object-contain relative z-10"
                />
                <span className="relative text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] dark:drop-shadow-[0_0_25px_rgba(6,182,212,0.8)] filter">
                  SyncScribes
                </span>
              </motion.div>
            </Link>
          </motion.div>

          {/* Center - Search Bar */}
          <motion.div
            animate={{
              opacity: isVisible ? 1 : 0,
              y: isVisible ? 0 : -10,
              pointerEvents: isVisible ? "auto" : "none"
            }}
            transition={{ duration: 0.3 }}
            className="hidden md:flex flex-1 max-w-md mx-auto justify-center px-4 pointer-events-auto"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative w-full group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full opacity-30 group-hover:opacity-100 blur transition duration-500 group-focus-within:opacity-100" />
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const query = formData.get('search');
                router.push(`/browse?search=${query}`);
              }} className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-slate-500 dark:text-slate-400 group-focus-within:text-primary transition-colors z-10" />
                <input
                  name="search"
                  type="text"
                  placeholder="Search books, authors..."
                  autoComplete="off"
                  className="w-full bg-white/90 dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full py-2 pl-12 pr-6 text-sm text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-0 shadow-lg transition-all"
                  onChange={(e) => {
                    if (window.location.pathname === '/browse') {
                      const url = new URL(window.location.href);
                      url.searchParams.set('search', e.target.value);
                      window.history.replaceState({}, '', url.toString());
                      // Trigger a custom event or just let browse page poll/listener
                      const event = new CustomEvent('search-change', { detail: e.target.value });
                      window.dispatchEvent(event);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && window.location.pathname !== '/browse') {
                      router.push(`/browse?search=${(e.target as HTMLInputElement).value}`);
                    }
                  }}
                />
              </form>
            </motion.div>
          </motion.div>

          {/* Right - Theme (Hiding), Sidebar (Always Fixed) */}
          <div className="flex items-center justify-end gap-2 pr-2 md:pr-4 pointer-events-auto">
            {/* Theme Toggle (Hiding on scroll) */}
            <motion.div
              animate={{
                opacity: isVisible ? 1 : 0,
                x: isVisible ? 0 : 20,
                pointerEvents: isVisible ? "auto" : "none"
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full bg-transparent text-foreground hover:bg-accent transition-colors"
              >
                {mounted ? (theme === 'dark' ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6" />) : <Sun className="w-6 h-6 opacity-0" />}
              </motion.button>
            </motion.div>

            {/* Sidebar Toggle (Plus Button) - ALWAYS VISIBLE */}
            <motion.button
              onClick={() => {
                onSidebarToggle?.();
              }}
              whileHover={{ scale: 1.1 }}

              whileTap={{ scale: 0.9 }}
              animate={{ rotate: isSidebarOpen ? 45 : 0 }}
              className={`flex items-center justify-center rounded-xl transition-all shadow-lg w-10 h-10 pointer-events-auto ${isSidebarOpen
                ? 'bg-primary text-white'
                : 'bg-background/80 backdrop-blur-md text-primary hover:bg-primary/10'
                }`}
            >
              <Plus className="w-6 h-6" strokeWidth={3} />
            </motion.button>

            {/* Mobile Menu Button (Hiding on scroll) */}
            <motion.button
              animate={{
                opacity: isVisible ? 1 : 0,
                pointerEvents: isVisible ? "auto" : "none"
              }}
              className="md:hidden text-foreground ml-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </motion.button>
          </div>
        </div>
      </div>


      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-background/95 backdrop-blur-3xl px-6 py-8 space-y-6 shadow-2xl border-b border-white/10 pointer-events-auto z-[130]"
          >
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search books..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm outline-none focus:border-primary transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    router.push(`/browse?search=${(e.target as HTMLInputElement).value}`);
                    setIsMobileMenuOpen(false);
                  }
                }}
              />
            </div>
            <Link href="/browse" onClick={() => setIsMobileMenuOpen(false)} className="block text-lg font-black text-foreground/60 hover:text-primary transition-colors uppercase tracking-[0.2em]">Library</Link>
            <Link href="/collections" onClick={() => setIsMobileMenuOpen(false)} className="block text-lg font-black text-foreground/60 hover:text-primary transition-colors uppercase tracking-[0.2em]">My Library</Link>
            <Link href="/meet" onClick={() => setIsMobileMenuOpen(false)} className="block text-lg font-black text-foreground/60 hover:text-primary transition-colors uppercase tracking-[0.2em]">SyncMeet</Link>
            <Link href="/subscription" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-foreground/60 hover:text-primary transition-colors uppercase tracking-widest block">Subscription</Link>
            {session && (
              <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block text-muted-foreground text-lg hover:text-foreground">Profile</Link>
            )}
            {!session && (
              <Link href="/auth/signin" className="block w-full text-center bg-primary text-primary-foreground py-3 rounded-xl font-bold mt-4 shadow-lg">
                Sign In
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
