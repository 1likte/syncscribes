import Link from 'next/link'
import {
    Instagram,
    Linkedin,
    Facebook,
    Youtube,
    Send,
    MessageSquare,
    Music2,
    BookOpen,
    Heart,
    X
} from 'lucide-react'

import { motion } from 'framer-motion'
import { useMemo } from 'react'

// Integrated Particle Component
const ParticleEffect = ({ count = 20 }: { count?: number }) => {
    const particles = useMemo(() =>
        Array.from({ length: count }).map((_, i) => ({
            id: i,
            size: Math.random() * 6 + 3,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            duration: Math.random() * 15 + 10,
            delay: Math.random() * 5,
            opacity: Math.random() * 0.4 + 0.2
        })), [count]
    );

    return (
        <div className="absolute inset-x-0 -top-40 -bottom-20 pointer-events-none z-0" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}>
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: [0, p.opacity, 0],
                        scale: [1, 2, 1],
                        x: [0, Math.random() * 120 - 60, 0],
                        y: [0, Math.random() * 120 - 60, 0]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "linear"
                    }}
                    className="absolute bg-primary/30 rounded-full blur-[5px]"
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

export default function Footer() {
    return (
        <footer className="w-full bg-slate-50 dark:bg-zinc-950/30 py-16 px-8 md:px-16 mt-auto relative z-10 border-t border-slate-200 dark:border-white/5">
            <div className="absolute inset-0 pointer-events-none">
                <ParticleEffect count={30} />
            </div>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 items-start text-center border-none">
                {/* Brand Section */}
                <div className="space-y-8 flex flex-col items-center">
                    <div className="space-y-4 flex flex-col items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-12 h-12 bg-[#ff2d75] flex items-center justify-center rounded-xl shadow-[0_0_20px_rgba(255,45,117,0.4)] border-none">
                                <BookOpen className="text-white" size={28} />
                            </div>
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                SyncScribes
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-white/40 text-base leading-relaxed max-w-[280px] transition-colors">
                            Where stories come alive. Join our community of readers and writers.
                        </p>
                    </div>

                    {/* Social Icons with Neon Glow */}
                    <div className="flex flex-wrap gap-2.5 justify-center">
                        {[
                            { icon: Facebook, href: 'https://facebook.com' },
                            {
                                icon: () => (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                                    </svg>
                                ),
                                href: 'https://x.com'
                            },
                            { icon: Instagram, href: 'https://instagram.com' },
                            { icon: Youtube, href: 'https://youtube.com' },
                            { icon: Music2, href: 'https://tiktok.com' },
                            { icon: Send, href: 'https://t.me' },
                            { icon: MessageSquare, href: 'https://messenger.com' },
                            { icon: Linkedin, href: 'https://linkedin.com' },
                        ].map((social, i) => (
                            <Link
                                key={i}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-lg bg-slate-200/50 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-white/40 hover:bg-[#ff2d75] hover:text-white hover:shadow-[0_0_15px_rgba(255,45,117,0.8)] hover:ring-2 hover:ring-[#ff2d75]/50 transition-all duration-300 transform hover:-translate-y-1 border-none shadow-none"
                            >
                                <social.icon size={18} />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* MAIN Section */}
                <div className="flex flex-col items-center border-none">
                    <h4 className="text-slate-900 dark:text-white font-bold text-lg tracking-widest mb-8 border-none outline-none">MAIN</h4>
                    <ul className="space-y-4 text-base text-slate-500 dark:text-white/40 border-none">
                        <li>
                            <Link href="/" className="hover:text-[#ff2d75] transition-colors">Home</Link>
                        </li>
                        <li>
                            <Link href="/browse" className="hover:text-[#ff2d75] transition-colors">Discover</Link>
                        </li>
                        <li>
                            <Link href="/contributors" className="hover:text-[#ff2d75] transition-colors">Contributors</Link>
                        </li>
                    </ul>
                </div>

                {/* COMMUNITY Section */}
                <div className="flex flex-col items-center border-none">
                    <h4 className="text-slate-900 dark:text-white font-bold text-lg tracking-widest mb-8 border-none outline-none">COMMUNITY</h4>
                    <ul className="space-y-4 text-base text-slate-500 dark:text-white/40 border-none">
                        <li>
                            <Link href="/meet" className="hover:text-[#ff2d75] transition-colors">Meet</Link>
                        </li>
                        <li>
                            <Link href="/chat" className="hover:text-[#ff2d75] transition-colors">Messages</Link>
                        </li>
                    </ul>
                </div>

                {/* LEGAL & SUPPORT Section */}
                <div className="flex flex-col items-center border-none">
                    <h4 className="text-slate-900 dark:text-white font-bold text-lg tracking-widest mb-8 border-none outline-none">LEGAL & SUPPORT</h4>
                    <ul className="space-y-4 text-base text-slate-500 dark:text-white/40 border-none">
                        <li>
                            <Link href="/terms" className="hover:text-[#ff2d75] transition-colors">Terms of Use</Link>
                        </li>
                        <li>
                            <Link href="/privacy" className="hover:text-[#ff2d75] transition-colors">Privacy Policy</Link>
                        </li>
                        <li>
                            <Link href="/cookie" className="hover:text-[#ff2d75] transition-colors">Cookie Policy</Link>
                        </li>
                        <li>
                            <Link href="/support" className="hover:text-[#ff2d75] transition-colors">Support</Link>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom Footer - Far Left and Far Right */}
            <div className="w-full mt-24 pt-0 flex flex-col md:flex-row justify-between items-center gap-6 text-[12px] text-slate-400 dark:text-white/30 transition-colors border-none shadow-none">
                <p>© 2026 SyncScribes. All rights reserved.</p>
                <div className="flex items-center gap-1.5 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all border-none shadow-none">
                    <span>Made with</span>
                    <Heart size={13} className="fill-[#ff2d75] text-[#ff2d75]" />
                    <span>by SyncScribes Team</span>
                </div>
            </div>
        </footer>
    )
}
