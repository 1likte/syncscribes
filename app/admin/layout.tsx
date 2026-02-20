'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    BookOpen,
    Settings,
    LogOut,
    ShieldCheck,
    Menu,
    X,
    PenTool
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { name: 'Users', icon: Users, href: '/admin/users' },
        { name: 'Books', icon: BookOpen, href: '/admin/books' },
        { name: 'Paylaşım Yeri', icon: PenTool, href: '/admin/shares' },
        { name: 'Settings', icon: Settings, href: '/admin/settings' },
    ]

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f0715] flex">
            {/* Sidebar */}
            <motion.aside
                initial={{ width: 280 }}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="fixed left-0 top-0 h-full bg-white dark:bg-black/40 backdrop-blur-xl border-r border-slate-200 dark:border-white/5 z-40 hidden md:block overflow-hidden"
            >
                <div className="p-6 flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                        <ShieldCheck size={20} />
                    </div>
                    {isSidebarOpen && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight"
                        >
                            Admin<span className="text-blue-600">Panel</span>
                        </motion.span>
                    )}
                </div>

                <nav className="space-y-2 px-4">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link key={item.href} href={item.href}>
                                <div className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-500 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                    }`}>
                                    <item.icon size={20} className={isActive ? 'text-white' : ''} />
                                    {isSidebarOpen && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="font-bold text-sm"
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                </div>
                            </Link>
                        )
                    })}

                    <div className="my-4 border-t border-slate-200 dark:border-white/5" />

                    <Link href="/">
                        <div className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-slate-500 dark:text-white/50 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-all group">
                            <LogOut size={20} className="group-hover:translate-x-[-2px] transition-transform" />
                            {isSidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="font-bold text-sm"
                                >
                                    Back to Site
                                </motion.span>
                            )}
                        </div>
                    </Link>
                </nav>

                {/* Integration Status */}
                {isSidebarOpen && (
                    <div className="absolute bottom-8 left-6 right-6">
                        <div className="p-4 rounded-2xl bg-slate-900 dark:bg-white/5 border border-white/5">
                            <h4 className="text-xs font-black text-slate-400 dark:text-white/40 uppercase tracking-widest mb-3">System Status</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500 dark:text-white/60">Database</span>
                                    <span className="text-green-500 font-bold flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Online
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500 dark:text-white/60">Realtime</span>
                                    <span className="text-blue-500 font-bold flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-[280px]' : 'md:ml-[80px]'}`}>
                {/* Top Header */}
                <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0f0715]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-8 py-5 flex items-center justify-between">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-white/60"
                    >
                        <Menu size={20} />
                    </button>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            Owner Access
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 p-[2px]">
                            <div className="w-full h-full rounded-full bg-white dark:bg-black overflow-hidden">
                                {/* User Avatar Placeholder */}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
