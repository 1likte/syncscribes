'use client'

import { motion } from 'framer-motion'
import {
    Shield,
    CheckCircle2,
    CreditCard,
    UserCheck,
    AlertCircle,
    FileText,
    Scale,
    Clock,
    ArrowRight
} from 'lucide-react'
import Link from 'next/link'

const sections = [
    {
        id: "1",
        title: "Eligibility",
        icon: UserCheck,
        content: "You must be at least 18 years old or have legal parental consent to use this platform. By registering, you confirm that all information provided is accurate and complete."
    },
    {
        id: "2",
        title: "Subscription & Payment",
        icon: CreditCard,
        content: "Access to premium features requires a €2 subscription payment. Payment grants access to unlimited reading and community interaction according to the active subscription period.",
        bullets: [
            "All payments are processed securely through Stripe/Third-party providers.",
            "Failure of payment may result in immediate restricted access.",
            "We reserve the right to modify pricing with 30-day prior notice."
        ]
    },
    {
        id: "3",
        title: "User Conduct",
        icon: Shield,
        content: "Users must maintain respectful and lawful communication at all times. The following behaviors are strictly prohibited:",
        bullets: [
            "Harassment, hate speech, or abusive language.",
            "Unauthorized distribution of copyrighted material.",
            "Attempting to bypass security or payment systems.",
            "Spamming or promotional misuse of the community."
        ]
    },
    {
        id: "4",
        title: "Intellectual Property",
        icon: FileText,
        content: "All content, branding, code, and platform materials are protected under applicable intellectual property laws. Unauthorized copying or commercial use is strictly prohibited."
    },
    {
        id: "5",
        title: "Limitation of Liability",
        icon: Scale,
        content: "The platform is provided 'as is'. We are not liable for indirect, incidental, or consequential damages arising from the use of the service."
    },
    {
        id: "6",
        title: "Modifications",
        icon: Clock,
        content: "We may update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the revised terms."
    }
]

export default function TermsPage() {
    return (
        <div className="relative min-h-screen bg-transparent pt-24 pb-20 px-4 md:px-8 selection:bg-[#ff2d75]/30 overflow-hidden">
            {/* Background Aesthetics */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#ff2d75]/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="container relative z-10 mx-auto max-w-5xl">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 text-slate-500 dark:text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                        <FileText size={14} className="text-[#ff2d75]" />
                        Legal Framework 2026
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none mb-6">
                        TERMS OF <span className="text-[#ff2d75] drop-shadow-[0_0_15px_rgba(255,45,117,0.4)]">SERVICE</span>
                    </h1>
                    <p className="text-slate-500 dark:text-white/60 text-base font-medium max-w-2xl mx-auto leading-relaxed">
                        These Terms of Use govern your access to and use of our platform.
                        By accessing our services, you agree to be legally bound by these protocols.
                    </p>
                </motion.div>

                {/* Content Grid */}
                <div className="grid gap-8">
                    {sections.map((section, idx) => (
                        <motion.div
                            key={section.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative group"
                        >
                            {/* Intensified Neon Glow Frame */}
                            <div className="absolute -inset-[2px] bg-gradient-to-r from-[#ff2d75] via-purple-500 to-[#ff2d75] rounded-[2.5rem] blur-lg opacity-30 group-hover:opacity-70 transition duration-700 animate-pulse" />

                            <div className="relative bg-white/90 dark:bg-[#0f0715]/90 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-[#ff2d75]/30 dark:border-[#ff2d75]/20 hover:border-[#ff2d75]/50 transition-all flex flex-col md:flex-row gap-8 shadow-[0_0_30px_rgba(255,45,117,0.1)] group-hover:shadow-[0_0_60px_rgba(255,45,117,0.25)] overflow-hidden">
                                <div className="flex-none">
                                    <div className="w-16 h-16 bg-[#ff2d75]/10 rounded-2xl flex items-center justify-center text-[#ff2d75] shadow-xl group-hover:bg-[#ff2d75] group-hover:text-white transition-all duration-500 transform group-hover:rotate-6 group-hover:scale-110">
                                        <section.icon size={30} />
                                    </div>
                                </div>
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[#ff2d75] font-black italic text-xl drop-shadow-[0_0_8px_rgba(255,45,117,0.4)]">0{section.id}</span>
                                        <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight uppercase group-hover:text-[#ff2d75] transition-colors">{section.title}</h3>
                                    </div>
                                    <p className="text-slate-600 dark:text-white/80 font-medium leading-relaxed">
                                        {section.content}
                                    </p>
                                    {section.bullets && (
                                        <ul className="space-y-3 mt-4 pl-4 border-l-2 border-[#ff2d75]/20 group-hover:border-[#ff2d75]/50 transition-colors">
                                            {section.bullets.map((bullet, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-500 dark:text-white/50 italic group-hover:text-slate-700 dark:group-hover:text-white/80 transition-colors">
                                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#ff2d75] flex-none shadow-[0_0_5px_rgba(255,45,117,0.8)]" />
                                                    {bullet}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-16 p-10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 rounded-[3rem] text-center border border-white/5 relative overflow-hidden group shadow-2xl"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-20 transform group-hover:rotate-12 transition-transform">
                        <Shield size={120} className="text-[#ff2d75]" />
                    </div>

                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4 relative z-10">
                        Questions about our <span className="text-[#ff2d75]">Policies?</span>
                    </h3>
                    <p className="text-white/60 mb-8 max-w-md mx-auto font-medium relative z-10 text-sm">
                        Our support team is available to clarify any legal or operational aspects of our platform.
                    </p>
                    <Link href="/support">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-[#ff2d75] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 mx-auto shadow-[0_15px_30px_rgba(255,45,117,0.3)] hover:shadow-[0_20px_40px_rgba(255,45,117,0.5)] transition-all"
                        >
                            Visit Support Center
                            <ArrowRight size={16} />
                        </motion.button>
                    </Link>
                </motion.div>

                <p className="text-center mt-12 text-slate-400 dark:text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">
                    SyncScribes Identity & Protocol • 2026
                </p>
            </div>
        </div>
    )
}
