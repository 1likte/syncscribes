import { prisma } from '@/lib/prisma'
import { MoreHorizontal, ShieldCheck, Mail, User as UserIcon } from 'lucide-react'
import { UserActions } from '@/components/admin/UserActions'
import { UserManagementHeader } from '@/components/admin/UserManagementHeader'
export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
    })

    return (
        <div className="space-y-8">
            <UserManagementHeader total={users.length} />

            <div className="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-white/5 text-xs uppercase text-slate-500 dark:text-white/40 font-black tracking-wider border-b border-slate-200 dark:border-white/5">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Created</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-[2px]">
                                            <div className="w-full h-full rounded-full bg-white dark:bg-black flex items-center justify-center text-xs font-black">
                                                {user.username.slice(0, 2).toUpperCase()}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{user.username}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                                <Mail size={10} />
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'OWNER' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                        user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                            'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 border-slate-200 dark:border-white/5'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {user.bannedUntil && new Date(user.bannedUntil) > new Date() ? (
                                        <span className="flex items-center gap-2 text-xs font-bold text-red-500">
                                            <span className="w-2 h-2 rounded-full bg-red-500" />
                                            BANNED
                                        </span>
                                    ) : (
                                        <span className={`flex items-center gap-2 text-xs font-bold ${user.subscriptionStatus === 'ACTIVE' ? 'text-green-500' : 'text-slate-400'
                                            }`}>
                                            <span className={`w-2 h-2 rounded-full ${user.subscriptionStatus === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'
                                                }`} />
                                            {user.subscriptionStatus || 'FREE'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-xs font-medium text-slate-500">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <UserActions user={user} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
