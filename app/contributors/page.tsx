'use client'

import { motion } from 'framer-motion'
import {
    Youtube,
    Instagram,
    Facebook,
    Twitter,
    Linkedin,
    Send,
    Code2,
    BookOpen,
    User,
    ChefHat,
    Zap,
    ShieldCheck
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const socialLinks = [
    { icon: Youtube, href: 'https://www.youtube.com/@chefyunuskalkan', color: 'text-red-500', label: 'YouTube' },
    { icon: Send, href: 'https://t.me/chefyunuskalkan', color: 'text-blue-400', label: 'Telegram' },
    { icon: Instagram, href: 'https://www.instagram.com/chefyunuskalkan', color: 'text-pink-500', label: 'Instagram' },
    { icon: Facebook, href: 'https://www.facebook.com/chefyunuskalkan', color: 'text-blue-600', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/chefyunuskalkan', color: 'text-sky-500', label: 'Twitter' },
    { icon: Linkedin, href: 'https://www.linkedin.com/in/chefyunuskalkan', color: 'text-blue-700', label: 'LinkedIn' },
]

const contributors = [
    {
        name: "ChefYunusKalkan",
        role: "Founder | Professional Chef | Digital Content Producer",
        bio: "ChefYunusKalkan leads SyncScribes, combining culinary expertise with digital strategy to deliver structured learning, engaging community dialogue, and innovative content across platforms.",
        icon: ChefHat,
        isFounder: true,
        socials: socialLinks
    },
    {
        name: "Yusuf Kalkan",
        role: "Technical Lead & Senior Architect",
        bio: "Mastermind behind the platform's core infrastructure. Specializes in scalable systems, database optimization, and high-performance engineering to ensure a seamless digital experience.",
        icon: Code2,
        isFounder: false
    },
    {
        name: "Muhammed Kalkan",
        role: "Head of Strategy & Experience",
        bio: "Drives the strategic growth and user experience standards. Focused on community engagement, interface refinement, and the overall premium feel of the SyncScribes universe.",
        icon: Zap,
        isFounder: false
    },
    {
        name: "Technical Development Team",
        role: "Backend & Security Engineering",
        bio: "Responsible for platform architecture, secure payment integration, compliance, and performance optimization to maintain a robust and reliable experience.",
        icon: ShieldCheck,
        isFounder: false
    },
    {
        name: "Content Contributors",
        role: "Book Curation & Moderation",
        bio: "Curate high-quality reading material and maintain a respectful, interactive environment for all users across the world.",
        icon: BookOpen,
        isFounder: false
    }
]

export default function ContributorsPage() {
    return (
        <div className="pt-24 pb-20 px-4 md:px-8 relative selection:bg-teal-400/30 min-h-screen">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-400/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-400/5 border border-teal-400/20 text-teal-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-[0_0_20px_rgba(45,212,191,0.1)]">
                        <User size={14} />
                        The Minds Behind
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-[1.1] mb-6 px-2">
                        Meet the <span className="text-teal-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.3)]">Dream Team</span>
                    </h1>
                    <p className="text-slate-500 dark:text-white/60 text-lg font-medium max-w-3xl mx-auto leading-relaxed">
                        SyncScribes thrives thanks to our passionate team. Each contributor brings expertise in technology,
                        content, or community building to ensure a premium, interactive, and educational experience.
                    </p>
                </motion.div>

                {/* Contributors Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Founder Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="md:col-span-2 lg:col-span-3 relative group"
                    >
                        {/* Intensified Neon Glow Frame */}
                        <div className="absolute -inset-[2px] bg-gradient-to-r from-teal-400 via-blue-500 to-teal-400 rounded-[3rem] blur-lg opacity-40 group-hover:opacity-80 transition duration-700 animate-pulse" />

                        <div className="relative bg-white/90 dark:bg-[#0f0715]/90 backdrop-blur-3xl p-6 md:p-14 rounded-[3rem] border border-teal-400/30 dark:border-teal-400/20 shadow-[0_0_50px_rgba(45,212,191,0.15)] group-hover:shadow-[0_0_80px_rgba(45,212,191,0.3)] overflow-hidden flex flex-col lg:flex-row items-center gap-8 md:gap-10 text-center lg:text-left transition-all duration-500">
                            <div className="flex-none relative pt-4">
                                <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-teal-400 to-blue-600 rounded-full p-[3px] shadow-[0_0_50px_rgba(45,212,191,0.6)]">
                                    <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center overflow-hidden relative">
                                        <ChefHat size={50} className="text-white relative z-10 md:hidden" />
                                        <ChefHat size={60} className="text-white relative z-10 hidden md:block" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-teal-400/20 to-transparent" />
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-teal-400 text-slate-900 px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(45,212,191,0.5)] z-20 whitespace-nowrap">
                                    Founder & Visionary
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                        {contributors[0].name}
                                    </h2>
                                    <p className="text-teal-400 font-bold uppercase tracking-widest text-xs drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]">
                                        {contributors[0].role}
                                    </p>
                                </div>
                                <p className="text-slate-600 dark:text-white/80 text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                                    {contributors[0].bio}
                                </p>

                                <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                                    {contributors[0].socials?.map((social, i) => (
                                        <Link
                                            key={i}
                                            href={social.href}
                                            target="_blank"
                                            className="group/icon relative"
                                        >
                                            <div className="absolute inset-0 bg-teal-400/30 rounded-xl blur-md opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                                            <div className="relative w-12 h-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-lg group-hover/icon:border-teal-400/50">
                                                <social.icon size={20} className={`${social.color} transition-all drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]`} />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Other Team Members */}
                    {contributors.slice(1).map((member, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative group h-full"
                        >
                            {/* Neon Glow Frame for Cards */}
                            <div className="absolute -inset-[1px] bg-gradient-to-b from-teal-400/20 via-transparent to-blue-500/20 rounded-[2.5rem] blur-md opacity-0 group-hover:opacity-100 transition duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-b from-teal-400/5 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition duration-500" />

                            <div className="relative bg-white/80 dark:bg-[#0f0715]/60 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 group-hover:border-teal-400/50 transition-all h-full flex flex-col items-center text-center shadow-lg group-hover:shadow-[0_0_30px_rgba(45,212,191,0.15)]">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 dark:text-white/40 mb-6 group-hover:scale-110 group-hover:text-teal-400 group-hover:bg-teal-400/10 transition-all duration-500 shadow-xl group-hover:shadow-[0_0_20px_rgba(45,212,191,0.2)]">
                                    <member.icon size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 group-hover:text-teal-400 transition-colors drop-shadow-[0_0_8px_rgba(45,212,191,0.3)]">
                                    {member.name}
                                </h3>
                                <p className="text-slate-400 dark:text-white/30 text-[10px] font-black uppercase tracking-widest mb-6 border-b border-transparent group-hover:border-teal-400/30 pb-2">
                                    {member.role}
                                </p>
                                <p className="text-slate-600 dark:text-white/60 text-sm font-medium leading-relaxed group-hover:text-slate-900 dark:group-hover:text-white/90 transition-colors">
                                    {member.bio}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
