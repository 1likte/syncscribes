'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface LogoProps {
    /** Size variant: 'sm' for mobile, 'md' for desktop */
    size?: 'sm' | 'md';
    /** Optional className for the container */
    className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
    const iconSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10 md:w-12 md:h-12';
    const textSize = size === 'sm' ? 'text-lg' : 'text-3xl md:text-4xl';
    const gap = size === 'sm' ? 'gap-2.5' : 'gap-3';

    return (
        <Link href="/" className={`flex items-center ${gap} group ${className}`}>
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex items-center"
            >
                <div className="absolute -inset-2 bg-primary/40 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse hidden md:block" />
                <img
                    src="/images/icon.png"
                    alt="SyncScribes Logo"
                    className={`${iconSize} object-contain relative z-10 drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.4)]`}
                />
                <span className={`${textSize} font-black tracking-tighter bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]`}>
                    SyncScribes
                </span>
            </motion.div>
        </Link>
    );
}
