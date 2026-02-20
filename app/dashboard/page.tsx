'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, DollarSign, Star, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalBooks: number
  totalUsers: number
  totalRevenue: number
  averageRating: number
  recentPurchases: number
  monthlyGrowth: number
}

interface RecentActivity {
  id: string
  type: 'purchase' | 'review' | 'upload'
  title: string
  user: string
  timestamp: string
  amount?: number
}

const mockStats: DashboardStats = {
  totalBooks: 1247,
  totalUsers: 3842,
  totalRevenue: 48756.89,
  averageRating: 4.6,
  recentPurchases: 156,
  monthlyGrowth: 23.5
}

const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    type: 'purchase',
    title: 'The Digital Revolution',
    user: 'john_doe',
    timestamp: '2 hours ago',
    amount: 19.99
  },
  {
    id: '2',
    type: 'review',
    title: 'Mindful Living',
    user: 'jane_smith',
    timestamp: '4 hours ago'
  },
  {
    id: '3',
    type: 'upload',
    title: 'Advanced TypeScript',
    user: 'tech_author',
    timestamp: '6 hours ago'
  },
  {
    id: '4',
    type: 'purchase',
    title: 'Business Strategy 2024',
    user: 'business_user',
    timestamp: '8 hours ago',
    amount: 29.99
  },
  {
    id: '5',
    type: 'review',
    title: 'The Art of Code',
    user: 'developer123',
    timestamp: '12 hours ago'
  }
]

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>(mockStats)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>(mockRecentActivity)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <DollarSign className="w-5 h-5 text-green-600" />
      case 'review':
        return <Star className="w-5 h-5 text-yellow-600" />
      case 'upload':
        return <BookOpen className="w-5 h-5 text-blue-600" />
      default:
        return <Calendar className="w-5 h-5 text-gray-600" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'bg-green-50 border-green-200'
      case 'review':
        return 'bg-yellow-50 border-yellow-200'
      case 'upload':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Welcome, {session.user?.username}! View the general status of your platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 rounded-full p-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalBooks.toLocaleString()}</h3>
            <p className="text-gray-600 text-sm">Books</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</h3>
            <p className="text-gray-600 text-sm">Users</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 rounded-full p-3">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</h3>
            <p className="text-gray-600 text-sm">Revenue</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 rounded-full p-3">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Average</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.averageRating}</h3>
            <p className="text-gray-600 text-sm">Rating</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activities</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-lg border ${getActivityColor(activity.type)}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                        <p className="text-xs text-gray-500">
                          {activity.user} • {activity.timestamp}
                        </p>
                      </div>
                    </div>
                    {activity.amount && (
                      <div className="text-sm font-semibold text-green-600">
                        ${activity.amount}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/books/new">
                  <Button className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Add New Book
                  </Button>
                </Link>
                <Link href="/books">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Manage Books
                  </Button>
                </Link>
                <Link href="/users">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Users
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </Link>

              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Monthly Growth</h3>
              <div className="text-3xl font-bold mb-2">+{stats.monthlyGrowth}%</div>
              <p className="text-blue-100 text-sm">
                Increase in book sales compared to last month
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
