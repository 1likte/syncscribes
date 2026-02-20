'use client';

import { Bell, Heart, MessageSquare, UserPlus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotificationsPage() {
    return (
        <div className="min-h-screen pt-24 pb-12 bg-transparent">
            <div className="container mx-auto px-6">
                <div className="max-w-2xl mx-auto space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-left"
                    >
                        <h1 className="text-6xl font-black text-foreground tracking-tighter italic">
                            NOTIFI<span className="text-primary">CATIONS</span>
                        </h1>
                        <p className="text-muted-foreground mt-4 text-lg">
                            Stay updated with the latest activity from your community.
                        </p>
                    </motion.div>

                    <div className="space-y-4">
                        <div className="py-20 text-center bg-card/10 backdrop-blur-xl rounded-[40px] border border-white/5">
                            <Bell className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-foreground/50">All caught up!</h3>
                            <p className="text-muted-foreground mt-2">New notifications will appear here as they arrive.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
