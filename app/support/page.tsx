'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Phone,
    MessageSquare,
    Mail,
    Clock,
    ShieldCheck,
    CreditCard,
    UserX,
    ChevronDown,
    Send,
    MessageCircle,
    Headphones,
    CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

const faqs = [
    {
        question: "Payment Issues",
        answer: "If your subscription payment was completed but access was not granted, please include your payment confirmation ID (from Stripe/Bank) when contacting us. We usually resolve this within 1-2 hours.",
        icon: CreditCard
    },
    {
        question: "Account Access Problems",
        answer: "Provide your registered email address and a clear explanation of the issue. If you've lost access, our security team will verify your identity before restoration.",
        icon: UserX
    },
    {
        question: "Community Policy Violations",
        answer: "Our platform enforces structured moderation. Violations of respectful communication standards may result in warnings or account suspension to protect our members.",
        icon: ShieldCheck
    }
]

export default function SupportPage() {
    const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success'>('idle')
    const [openFaq, setOpenFaq] = useState<number | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setFormStatus('loading')

        const form = e.currentTarget
        const formData = new FormData(form)

        try {
            const response = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    message: formData.get('message'),
                }),
            })

            if (response.ok) {
                setFormStatus('success')
                form.reset()
            } else {
                setFormStatus('idle')
                alert('Something went wrong. Please try again.')
            }
        } catch (error) {
            setFormStatus('idle')
            alert('Failed to connect to support server.')
        }
    }

    return (
        <div className="relative min-h-screen bg-transparent pt-20 pb-12 px-4 md:px-8 selection:bg-[#ff2d75]/30">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff2d75]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ff2d75]/10 border border-[#ff2d75]/20 text-[#ff2d75] text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        <Headphones size={13} />
                        24/7 Support Center
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none mb-4">
                        WE ARE HERE <span className="text-[#ff2d75] drop-shadow-[0_0_15px_rgba(255,45,117,0.4)]">TO HELP</span>
                    </h1>
                    <p className="text-slate-500 dark:text-white/60 text-base font-medium max-w-2xl mx-auto">
                        Structured, fast, and professional support for all premium members.
                        Your experience and access quality are our operational priority.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Direct Contact Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative group h-fit"
                        >
                            {/* Intensified Neon Glow Frame */}
                            <div className="absolute -inset-[2px] bg-gradient-to-r from-[#ff2d75] via-purple-500 to-[#ff2d75] rounded-[2rem] blur-lg opacity-30 group-hover:opacity-70 transition duration-700 animate-pulse" />

                            <div className="relative bg-white/90 dark:bg-[#0f0715]/90 backdrop-blur-3xl p-8 rounded-[2rem] border border-[#ff2d75]/30 dark:border-[#ff2d75]/20 shadow-[0_0_30px_rgba(255,45,117,0.15)] group-hover:shadow-[0_0_60px_rgba(255,45,117,0.25)] transition-all">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8 border-b border-slate-200 dark:border-white/5 pb-4 italic">
                                    Direct <span className="text-[#ff2d75]">Contact</span>
                                </h3>

                                <div className="space-y-8">
                                    <div className="flex gap-4 group/item">
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-[#ff2d75] group-hover/item:scale-110 transition-transform shadow-lg">
                                            <Phone size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">Phone Number</p>
                                            <p className="text-lg font-bold text-slate-800 dark:text-white">+49 1520 4481954</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 group/item">
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-blue-500 group-hover/item:scale-110 transition-transform shadow-lg">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">Response Time</p>
                                            <p className="text-lg font-bold text-slate-800 dark:text-white">Within 1-24 Hours</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 group/item">
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-green-500 group-hover/item:scale-110 transition-transform shadow-lg">
                                            <MessageCircle size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">Availability</p>
                                            <p className="text-lg font-bold text-slate-800 dark:text-white">Mon – Sat Full-Service</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col gap-3">
                                    <Button
                                        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-5 rounded-2xl font-black uppercase tracking-widest group shadow-lg shadow-green-500/20 text-xs"
                                        onClick={() => window.open('https://wa.me/4915204481954', '_blank')}
                                    >
                                        <MessageCircle className="mr-2 group-hover:rotate-12 transition-transform w-4 h-4" />
                                        WhatsApp Support
                                    </Button>
                                    <Button className="w-full bg-[#ff2d75] hover:bg-[#ff2d75]/90 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-[#ff2d75]/20 text-xs">
                                        Start Live Chat
                                    </Button>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-blue-600/10 backdrop-blur-xl p-8 rounded-[2rem] border border-blue-500/20"
                        >
                            <h4 className="text-blue-500 font-black text-xs uppercase tracking-[0.2em] mb-2 italic">Pro Tip</h4>
                            <p className="text-slate-600 dark:text-white/70 text-sm font-medium leading-relaxed">
                                Include your <span className="text-blue-500 font-bold">Registration Email</span> and a screenshot of the issue for 2x faster resolution.
                            </p>
                        </motion.div>
                    </div>

                    {/* Middle: Support Form */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="relative group h-fit"
                        >
                            {/* Intensified Neon Glow Frame */}
                            <div className="absolute -inset-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-[3rem] blur-lg opacity-30 group-hover:opacity-70 transition duration-700 animate-pulse" />

                            <div className="relative bg-white/90 dark:bg-[#0f0715]/90 backdrop-blur-3xl p-10 rounded-[3rem] border border-blue-500/30 dark:border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.15)] group-hover:shadow-[0_0_80px_rgba(59,130,246,0.25)] overflow-hidden transition-all">
                                {formStatus === 'success' ? (
                                    <div className="py-20 text-center space-y-6">
                                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                                            <CheckCircle2 size={48} className="text-white" />
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic leading-none">Request <span className="text-[#ff2d75]">Received!</span></h3>
                                        <p className="text-slate-500 dark:text-white/50 font-bold uppercase tracking-widest text-xs">A support specialist will contact you soon.</p>
                                        <Button
                                            onClick={() => setFormStatus('idle')}
                                            variant="outline"
                                            className="rounded-full px-8 py-6 border-slate-200 dark:border-white/10 font-bold"
                                        >
                                            Send Another Request
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mb-10">
                                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic leading-none">Open a <span className="text-[#ff2d75]">Support Ticket</span></h2>
                                            <p className="text-slate-400 dark:text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Formal operational request system</p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40 ml-4">Full Name</label>
                                                    <input
                                                        required
                                                        name="name"
                                                        type="text"
                                                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#ff2d75]/50 outline-none transition-all text-slate-900 dark:text-white font-bold"
                                                        placeholder="John Doe"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40 ml-4">Email Address</label>
                                                    <input
                                                        required
                                                        name="email"
                                                        type="email"
                                                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-[#ff2d75]/50 outline-none transition-all text-slate-900 dark:text-white font-bold"
                                                        placeholder="john@example.com"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/40 ml-4">Describe the Issue</label>
                                                <textarea
                                                    required
                                                    name="message"
                                                    rows={6}
                                                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-3xl px-6 py-4 focus:ring-2 focus:ring-[#ff2d75]/50 outline-none transition-all text-slate-900 dark:text-white font-bold resize-none"
                                                    placeholder="Please be specific. For payment issues, include Transaction ID."
                                                />
                                            </div>

                                            <Button
                                                disabled={formStatus === 'loading'}
                                                type="submit"
                                                className="w-full bg-[#ff2d75] hover:bg-[#ff2d75]/90 text-white py-8 rounded-2xl font-black uppercase tracking-[0.2em] text-lg shadow-[0_20px_40px_rgba(255,45,117,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3"
                                            >
                                                {formStatus === 'loading' ? (
                                                    <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <Send size={20} />
                                                        Submit Request
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    </>
                                )}
                            </div>
                        </motion.div>

                        {/* FAQs */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="space-y-4"
                        >
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 ml-4">
                                Common <span className="text-blue-500">Support Topics</span>
                            </h3>

                            {faqs.map((faq, i) => (
                                <div
                                    key={i}
                                    className="bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden transition-all hover:bg-white/70 dark:hover:bg-white/10"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full flex items-center justify-between p-6 text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                                                <faq.icon size={18} />
                                            </div>
                                            <span className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{faq.question}</span>
                                        </div>
                                        <ChevronDown className={`text-slate-400 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {openFaq === i && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="px-6 pb-6 pt-2"
                                            >
                                                <p className="text-slate-500 dark:text-white/60 font-medium leading-relaxed pl-[60px]">
                                                    {faq.answer}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
