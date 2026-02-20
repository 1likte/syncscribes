'use client'

import React, { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { CreateUserModal } from './CreateUserModal'

export function UserManagementHeader({ total }: { total: number }) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    User <span className="text-blue-600">Management</span>
                </h1>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Configure and manage system participants</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-200 dark:border-white/5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Total Members: {total}
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                    <UserPlus size={14} />
                    New Participant
                </button>
            </div>

            <CreateUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    )
}
