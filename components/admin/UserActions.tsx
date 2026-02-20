'use client'

import React, { useState } from 'react'
import { MoreHorizontal, Ban, ShieldCheck, UserX } from 'lucide-react'

export function UserActions({ user }: { user: any }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const isBanned = user.bannedUntil && new Date(user.bannedUntil) > new Date()

    const handleBan = async () => {
        if (!confirm('Are you sure you want to BAN this user?')) return
        setIsLoading(true)
        try {
            await fetch(`/api/admin/users/${user.id}/ban`, {
                method: 'POST',
                body: JSON.stringify({ banDurationDays: 365, reason: 'Admin Action' })
            })
            window.location.reload()
        } catch (error) {
            alert('Error banning user')
        } finally {
            setIsLoading(false)
        }
    }

    const handleUnban = async () => {
        if (!confirm('Unban this user?')) return
        setIsLoading(true)
        try {
            await fetch(`/api/admin/users/${user.id}/ban`, {
                method: 'DELETE'
            })
            window.location.reload()
        } catch (error) {
            alert('Error unbanning user')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:text-white/40 dark:hover:text-white transition-colors"
            >
                <MoreHorizontal size={16} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
                        {isBanned ? (
                            <button
                                onClick={handleUnban}
                                disabled={isLoading}
                                className="w-full px-4 py-3 text-left text-sm font-bold text-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 flex items-center gap-2"
                            >
                                <ShieldCheck size={16} />
                                Unban User
                            </button>
                        ) : (
                            <button
                                onClick={handleBan}
                                disabled={isLoading}
                                className="w-full px-4 py-3 text-left text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                            >
                                <Ban size={16} />
                                Ban User
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
