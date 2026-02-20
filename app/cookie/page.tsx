'use client'

import { motion } from 'framer-motion'
import {
    Cookie,
    ShieldCheck,
    Zap,
    BarChart3,
    Settings2,
    MousePointer2,
    Info,
    ArrowRight,
    HelpCircle,
    Settings,
    FileLock2,
    ShieldAlert
} from 'lucide-react'
import Link from 'next/link'

const cookieTypes = [
    {
        title: "Essential Cookies",
        icon: Zap,
        color: "text-amber-500",
        shadow: "shadow-amber-500/20",
        content: "These are strictly necessary for the platform to function. They handle secure login, subscription verification, and session management.",
        status: "Always Active"
    },
    {
        title: "Performance & Analytics",
        icon: BarChart3,
        color: "text-blue-500",
        shadow: "shadow-blue-500/20",
        content: "We use these to understand how visitors interact with SyncScribes. All data is anonymized and used for optimizing speed and usability.",
        status: "Optional"
    },
    {
        title: "Functional Cookies",
        icon: Settings2,
        color: "text-purple-500",
        shadow: "shadow-purple-500/20",
        content: "These remember your preferences, like theme settings (Light/Dark) and language, providing a more personalized experience.",
        status: "Optional"
    }
]

export default function CookiePolicyPage() {
    return (
        <div className="relative min-h-screen bg-transparent pt-24 pb-20 px-4 md:px-8 selection:bg-[#ff2d75]/30 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#ff2d75]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="container relative z-10 mx-auto max-w-5xl">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/5 border border-amber-500/10 text-amber-600 dark:text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                        <Cookie size={14} />
                        SyncScribes Cookie Protocol
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none mb-6">
                        COOKIE <span className="text-[#ff2d75] drop-shadow-[0_0_15px_rgba(255,45,117,0.4)]">POLICY</span>
                    </h1>
                    <p className="text-slate-500 dark:text-white/60 text-base font-medium max-w-2xl mx-auto leading-relaxed">
                        This policy explains how we use tracking technologies to enhance your
                        digital experience while maintaining strict privacy standards.
                    </p>
                </motion.div>

                {/* Main Content Card with Neon Border */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group mb-12"
                >
                    {/* Intensified Neon Frame */}
                    <div className="absolute -inset-[2px] bg-gradient-to-r from-[#ff2d75] via-amber-500 to-[#ff2d75] rounded-[2.5rem] blur-lg opacity-40 group-hover:opacity-80 transition duration-1000 group-hover:duration-200 pointer-events-none animate-pulse" />

                    <div className="relative bg-white/90 dark:bg-[#0f0715]/90 backdrop-blur-3xl p-10 md:p-14 rounded-[2.5rem] border border-amber-500/30 dark:border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.15)] group-hover:shadow-[0_0_80px_rgba(245,158,11,0.3)]">
                        <div className="space-y-12">
                            <section>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                        <Info size={24} />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">What are <span className="text-[#ff2d75]">Cookies?</span></h2>
                                </div>
                                <p className="text-slate-600 dark:text-white/70 text-lg leading-relaxed font-medium">
                                    Cookies are small text files stored on your device that help us provide essential functionality,
                                    remember your settings, and understand site performance. They act as a "memory" for the website,
                                    ensuring you don't have to log in every time you change pages.
                                </p>
                            </section>

                            <div className="grid md:grid-cols-3 gap-6">
                                {cookieTypes.map((type, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="relative group/item bg-slate-50 dark:bg-white/5 p-8 rounded-3xl border border-slate-200 dark:border-white/5 hover:border-amber-500/30 transition-all flex flex-col items-center text-center overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-500" />

                                        <div className={`w-14 h-14 ${type.color} bg-current/10 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover/item:scale-110 transition-transform relative z-10`}>
                                            <type.icon size={26} />
                                        </div>
                                        <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4 relative z-10">{type.title}</h4>
                                        <p className="text-xs text-slate-500 dark:text-white/40 font-medium mb-6 leading-relaxed flex-grow relative z-10">
                                            {type.content}
                                        </p>
                                        <div className="px-4 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/10 text-[10px] font-black uppercase tracking-widest text-[#ff2d75] relative z-10 group-hover/item:bg-[#ff2d75]/10 group-hover/item:text-[#ff2d75] transition-colors">
                                            {type.status}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <section className="pt-10 border-t border-slate-200 dark:border-white/5">
                                <div className="grid md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck className="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" size={20} />
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">GDPR Compliance</h3>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-white/50 font-medium leading-relaxed">
                                            For users in the EEA, we process cookies based on Article 6(1)(a) for consent and
                                            Article 6(1)(f) for legitimate interests (essential functionality and security).
                                        </p>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <MousePointer2 className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" size={20} />
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">Global Control</h3>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-white/50 font-medium leading-relaxed">
                                            You can block or delete cookies anytime via your browser settings. Note that disabling
                                            essential cookies will restrict access to premium book content and community features.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </motion.div>

                {/* Dynamic Management Info */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="mt-20 relative group"
                >
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-500/30 via-transparent to-amber-500/30 rounded-[3rem] blur-sm opacity-50 group-hover:opacity-100 transition duration-500" />

                    <div className="relative p-12 bg-white/90 dark:bg-black/60 backdrop-blur-3xl rounded-[3rem] text-center border border-slate-200 dark:border-white/10 shadow-2xl">
                        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)] group-hover:scale-110 transition-transform duration-500">
                            <Settings size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                            Manage Your <span className="text-amber-500">Consent</span>
                        </h2>
                        <p className="text-slate-500 dark:text-white/50 max-w-xl mx-auto font-medium mb-8">
                            You can update your cookie preferences at any time. Our "Privacy Shield" system
                            is fully compliant with GDPR and Google's Consent Mode v2.
                        </p>

                        <div className="p-6 bg-slate-900/5 dark:bg-white/5 rounded-3xl border border-transparent inline-block">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff2d75] animate-pulse">
                                Note: Settings are stored locally in your browser vault.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Footer Link Box */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="p-10 bg-gradient-to-br from-[#ff2d75] to-pink-600 rounded-[3rem] text-center shadow-2xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 left-0 p-10 opacity-10 transform scale-150 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                        <Cookie size={200} className="text-white" />
                    </div>

                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4 relative z-10 italic">
                        Questions about <span className="underline decoration-white/30 italic">Protocol?</span>
                    </h3>
                    <p className="text-white/80 mb-8 max-w-md mx-auto font-medium relative z-10 text-sm">
                        Our technical support team is available to clarify how our tracking technologies work.
                    </p>
                    <Link href="/support">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-[#ff2d75] px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 mx-auto shadow-xl"
                        >
                            Help Center
                            <ArrowRight size={16} />
                        </motion.button>
                    </Link>
                </motion.div>

                <p className="text-center mt-12 text-slate-400 dark:text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">
                    SyncScribes Nexus • Cookie Management 2026
                </p>
            </div>
        </div>
    )
}
