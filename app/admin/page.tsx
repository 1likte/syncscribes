import { prisma } from '@/lib/prisma'
import {
  Users,
  BookOpen,
  CreditCard,
  ShieldCheck
} from 'lucide-react'
import { UserManagementHeader } from '@/components/admin/UserManagementHeader'

export const dynamic = 'force-dynamic'

// Server Component
export default async function AdminPage() {
  const userCount = await prisma.user.count()
  const bookCount = await prisma.book.count()
  const activeSubs = await prisma.user.count({ where: { subscriptionStatus: 'ACTIVE' } })

  // Mock revenue - real implementation requires Stripe balance fetch
  const estimatedRevenue = activeSubs * 2

  const stats = [
    { label: 'Total Users', value: userCount, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Books Published', value: bookCount, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Active Subscriptions', value: activeSubs, icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Monthly Revenue', value: `€${estimatedRevenue}`, icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
        System <span className="text-blue-600">Overview</span>
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-500 dark:text-white/50 uppercase tracking-wide">{stat.label}</h3>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <p className={`text-4xl font-black tracking-tight ${stat.color} drop-shadow-sm`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Activity Table (Mocked) */}
      <div className="bg-white dark:bg-white/5 p-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live Activity Feed
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xs">U</div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white text-sm">New User Registered</p>
                <p className="text-xs text-slate-400">Just now</p>
              </div>
            </div>
            <span className="text-green-500 font-bold text-xs bg-green-500/10 px-3 py-1 rounded-full">Success</span>
          </div>
          {/* Add more mocked rows */}
        </div>
      </div>
    </div>
  )
}
