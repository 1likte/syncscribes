'use client'

import { motion } from 'framer-motion'
import {
    Lock,
    Eye,
    Database,
    UserCheck,
    ShieldCheck,
    CreditCard,
    RotateCcw,
    FileLock2,
    Cookie,
    Mail
} from 'lucide-react'
import Link from 'next/link'

const privacySections = [
    {
        id: "1",
        title: "Data We Collect",
        icon: Database,
        content: "To provide a seamless reading and community experience, we collect specific categories of personal information:",
        bullets: [
            "Full name and verified email address for account integrity.",
            "Payment confirmation and transaction IDs (handled by secure providers).",
            "Technical logs: IP address, device type, and session metadata.",
            "Internal communication: Messages and interactions within the SyncScribes platform."
        ]
    },
    {
        id: "2",
        title: "Purpose of Processing",
        icon: Eye,
        content: "Your data is used exclusively to maintain and enhance your experience on our platform:",
        bullets: [
            "Managing premium subscription access and book permissions.",
            "Processing secure transactions via Stripe/third-party gateways.",
            "Personalizing content recommendations based on reading habits.",
            "Fraud prevention and automated security monitoring.",
            "Legal compliance and platform policy enforcement."
        ]
    },
    {
        id: "3",
        title: "GDPR & Legal Basis",
        icon: UserCheck,
        content: "For our users in the European Union, we process data according to Article 6 of the GDPR:",
        bullets: [
            "Contractual Necessity: Providing the services you subscribed for.",
            "Legitimate Interests: Ensuring platform security and continuous improvement.",
            "Legal Obligations: Complying with tax and administrative regulations.",
            "Explicit Consent: For optional features like marketing communications."
        ]
    },
    {
        id: "4",
        title: "Secure Payment Systems",
        icon: CreditCard,
        content: "SyncScribes prioritizes your financial security. All payments are routed through encrypted third-party providers. We do not store full credit card numbers or sensitive CVV codes on our own database."
    },
    {
        id: "5",
        title: "User Rights & Control",
        icon: ShieldCheck,
        content: "You maintain full control over your digital footprint. Under applicable laws, you have the right to:",
        bullets: [
            "Access and export your personal data profile.",
            "Request immediate correction of inaccurate information.",
            "Invoke the 'Right to be Forgotten' (Account & Data Deletion).",
            "Object to specific types of data processing or profiling."
        ]
    },
    {
        id: "6",
        title: "Cookies & Tracking",
        icon: Cookie,
        content: "We use essential 'Functional Cookies' to keep you logged in and 'Analytical Cookies' to understand site performance. You can manage these preferences in your browser settings at any time."
    }
]

export default function PrivacyPage() {
    return (
        <div className="relative min-h-screen bg-transparent pt-24 pb-20 px-4 md:px-8 selection:bg-[#ff2d75]/30 overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-[#ff2d75]/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="container relative z-10 mx-auto max-w-5xl">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/5 border border-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                        <Lock size={14} />
                        Data Protection Protocol
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none mb-6">
                        PRIVACY <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">POLICY</span>
                    </h1>
                    <p className="text-slate-500 dark:text-white/60 text-base font-medium max-w-2xl mx-auto leading-relaxed">
                        Transparency is our foundational principle. This document outlines how
                        SyncScribes safeguards your digital identity and personal data.
                    </p>
                </motion.div>

                {/* Privacy Topics Grid */}
                <div className="grid gap-8">
                    {privacySections.map((section, idx) => (
                        <motion.div
                            key={section.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative group"
                        >
                            {/* Intensified Neon Glow Frame */}
                            <div className="absolute -inset-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-[2.5rem] blur-lg opacity-30 group-hover:opacity-70 transition duration-700 animate-pulse" />

                            <div className="relative bg-white/90 dark:bg-[#0f0715]/90 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-blue-500/30 dark:border-blue-500/20 hover:border-blue-500/50 transition-all overflow-hidden flex flex-col md:flex-row gap-8 shadow-[0_0_30px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_60px_rgba(59,130,246,0.25)]">
                                {/* Decorative background number */}
                                <span className="absolute -right-4 -top-8 text-[120px] font-black text-slate-900/[0.03] dark:text-white/[0.03] select-none pointer-events-none italic">
                                    0{section.id}
                                </span>

                                <div className="flex-none">
                                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-xl group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 transform group-hover:rotate-6 group-hover:scale-110">
                                        <section.icon size={30} />
                                    </div>
                                </div>
                                <div className="space-y-4 flex-1 relative z-10">
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight uppercase group-hover:text-blue-500 transition-colors italic drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                                        {section.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-white/80 font-medium leading-relaxed">
                                        {section.content}
                                    </p>
                                    {section.bullets && (
                                        <div className="grid sm:grid-cols-2 gap-4 mt-6">
                                            {section.bullets.map((bullet, i) => (
                                                <div key={i} className="flex items-start gap-3 p-4 bg-slate-900/5 dark:bg-white/5 rounded-2xl border border-transparent hover:border-blue-500/30 transition-all group/item hover:shadow-lg">
                                                    <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-none animate-pulse shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/50 leading-tight italic group-hover/item:text-slate-700 dark:group-hover/item:text-white/80 transition-colors">
                                                        {bullet}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Contact Footer */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="mt-20 relative group"
                >
                    {/* Neon Glow Frame for Footer CTA */}
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-600/50 via-transparent to-blue-600/50 rounded-[3rem] blur-md opacity-30 group-hover:opacity-100 transition duration-1000" />

                    <div className="relative p-12 bg-white dark:bg-black/60 backdrop-blur-3xl rounded-[3rem] text-center border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent pointer-events-none" />

                        <div className="relative z-10 space-y-6">
                            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)] group-hover:scale-110 transition-transform duration-500">
                                <FileLock2 size={40} />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                                Your Privacy is <span className="text-blue-500">Encrypted</span>
                            </h2>
                            <p className="text-slate-500 dark:text-white/50 max-w-xl mx-auto font-medium">
                                Have specific questions about your data or want to request a full account export?
                                Our Data Protection Officer is ready to assist you.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                                <Link href="/support">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_15px_30px_rgba(59,130,246,0.3)] transition-all flex items-center gap-2"
                                    >
                                        <Mail size={14} />
                                        Contact Privacy Team
                                    </motion.button>
                                </Link>
                                <Link href="/terms">
                                    <button className="px-8 py-4 bg-slate-900/5 dark:bg-white/5 text-slate-500 dark:text-white/40 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900/10 dark:hover:bg-white/10 transition-all">
                                        Read Terms of Service
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Final Signature */}
                <p className="text-center mt-12 text-slate-400 dark:text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">
                    SyncScribes Vault • Privacy Excellence 2026
                </p>
            </div>
        </div>
    )
}
