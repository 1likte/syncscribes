'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Settings, X, ChevronRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type ConsentSettings = {
    necessary: boolean
    analytics: boolean
    marketing: boolean
}

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [settings, setSettings] = useState<ConsentSettings>({
        necessary: true,
        analytics: false,
        marketing: false
    })

    useEffect(() => {
        // Check if consent was already given
        const savedConsent = localStorage.getItem('syncscribes_consent')
        if (!savedConsent) {
            const timer = setTimeout(() => setIsVisible(true), 2000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAcceptAll = () => {
        const fullConsent = { necessary: true, analytics: true, marketing: true }
        saveConsent(fullConsent)
    }

    const handleRejectAll = () => {
        const minimalConsent = { necessary: true, analytics: false, marketing: false }
        saveConsent(minimalConsent)
    }

    const handleSaveCustom = () => {
        saveConsent(settings)
    }

    const saveConsent = (consent: ConsentSettings) => {
        localStorage.setItem('syncscribes_consent', JSON.stringify({
            ...consent,
            timestamp: new Date().toISOString()
        }))

        // Google Analytics Consent Mode v2 Integration
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('consent', 'update', {
                'analytics_storage': consent.analytics ? 'granted' : 'denied',
                'ad_storage': consent.marketing ? 'granted' : 'denied',
                'ad_user_data': consent.marketing ? 'granted' : 'denied',
                'ad_personalization': consent.marketing ? 'granted' : 'denied',
            })
        }

        setIsVisible(false)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[9999] flex items-end justify-center md:justify-end p-6 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="w-full max-w-lg pointer-events-auto"
                    >
                        <div className="relative group">
                            {/* Neon Glow Frame */}
                            <div className="absolute -inset-[1px] bg-gradient-to-r from-[#ff2d75]/30 via-blue-500/30 to-[#ff2d75]/30 rounded-[2.5rem] blur-sm opacity-100" />

                            <div className="relative bg-white/95 dark:bg-[#0f0715]/90 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
                                <button
                                    onClick={() => isVisible && setIsVisible(false)}
                                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>

                                {!showSettings ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-lg">
                                                <ShieldCheck size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic leading-none">
                                                    Privacy <span className="text-[#ff2d75]">Shield</span>
                                                </h3>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 mt-1">Consent Protocol 2026</p>
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-600 dark:text-white/60 font-medium leading-relaxed">
                                            We use cookies to synchronize your experience and analyze our secure operations.
                                            By clicking "Synchronize All", you agree to our full data processing protocol.
                                        </p>

                                        <div className="flex flex-col gap-3">
                                            <Button
                                                onClick={handleAcceptAll}
                                                className="w-full bg-[#ff2d75] hover:bg-[#ff2d75]/90 text-white h-12 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#ff2d75]/20 group"
                                            >
                                                Synchronize All
                                                <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Button
                                                    onClick={handleRejectAll}
                                                    variant="outline"
                                                    className="border-slate-200 dark:border-white/10 h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-500 dark:text-white/40"
                                                >
                                                    Reject Optional
                                                </Button>
                                                <Button
                                                    onClick={() => setShowSettings(true)}
                                                    variant="outline"
                                                    className="border-slate-200 dark:border-white/10 h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-slate-500 dark:text-white/40 flex items-center gap-2"
                                                >
                                                    <Settings size={14} />
                                                    Customize
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setShowSettings(false)}
                                                className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                            >
                                                <ChevronRight size={20} className="rotate-180" />
                                            </button>
                                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Customize <span className="text-blue-500">Vault</span></h3>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Necessary</p>
                                                    <p className="text-[10px] text-slate-400 dark:text-white/30 font-bold italic">Always Active</p>
                                                </div>
                                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">
                                                    <Check size={14} strokeWidth={4} />
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setSettings(s => ({ ...s, analytics: !s.analytics }))}
                                                className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group/btn ${settings.analytics
                                                        ? 'bg-blue-500/10 border-blue-500/30'
                                                        : 'bg-slate-50 dark:bg-white/5 border-transparent'
                                                    }`}
                                            >
                                                <div className="text-left">
                                                    <p className={`text-xs font-black uppercase tracking-widest ${settings.analytics ? 'text-blue-500' : 'text-slate-500 dark:text-white/40'}`}>Analytical</p>
                                                    <p className="text-[10px] text-slate-400 dark:text-white/20 font-bold italic">Process traffic data</p>
                                                </div>
                                                <div className={`w-12 h-6 rounded-full relative transition-colors ${settings.analytics ? 'bg-blue-500' : 'bg-slate-300 dark:bg-white/10'}`}>
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.analytics ? 'left-7' : 'left-1'}`} />
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => setSettings(s => ({ ...s, marketing: !s.marketing }))}
                                                className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group/btn ${settings.marketing
                                                        ? 'bg-[#ff2d75]/10 border-[#ff2d75]/30'
                                                        : 'bg-slate-50 dark:bg-white/5 border-transparent'
                                                    }`}
                                            >
                                                <div className="text-left">
                                                    <p className={`text-xs font-black uppercase tracking-widest ${settings.marketing ? 'text-[#ff2d75]' : 'text-slate-500 dark:text-white/40'}`}>Operational</p>
                                                    <p className="text-[10px] text-slate-400 dark:text-white/20 font-bold italic">Marketing & Social</p>
                                                </div>
                                                <div className={`w-12 h-6 rounded-full relative transition-colors ${settings.marketing ? 'bg-[#ff2d75]' : 'bg-slate-300 dark:bg-white/10'}`}>
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.marketing ? 'left-7' : 'left-1'}`} />
                                                </div>
                                            </button>
                                        </div>

                                        <Button
                                            onClick={handleSaveCustom}
                                            className="w-full bg-slate-900 dark:bg-white text-white dark:text-black h-12 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                                        >
                                            Confirm Choices
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
