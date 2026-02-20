'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundContent() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background z-[1000]">
            <div className="text-center px-4">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 flex justify-center"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                        <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                            <BookOpen className="w-12 h-12 text-white" />
                        </div>
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-8xl font-black text-foreground mb-4 tracking-tighter italic"
                >
                    404
                </motion.h1>

                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-foreground/80 mb-6 uppercase tracking-widest"
                >
                    Page Not Found
                </motion.h2>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-muted-foreground max-w-md mx-auto mb-10 text-lg"
                >
                    The book or page you are looking for may not be in our library. Perhaps it hasn't been written yet.
                </motion.p>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link href="/">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all uppercase text-sm tracking-widest"
                        >
                            <Home className="w-4 h-4" />
                            Back to Home
                        </motion.button>
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 bg-secondary text-foreground px-8 py-4 rounded-xl font-bold hover:bg-accent transition-all uppercase text-sm tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
