'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  Settings, 
  LogOut, 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  X,
  Save,
  Ban,
  Unlock
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalBooks: number
  activeSubscriptions: number
  monthlyRevenue: number
}

interface Book {
  id: string
  title: string
  description?: string
  author: {
    id: string
    username: string
  } | string
  category: string
  status: string
  priority?: number
  isHidden?: boolean
  fileUrl?: string
  coverImage?: string
  createdAt: string
}

interface User {
  id: string
  username: string
  role: string
  bannedUntil: string | null
  createdAt: string
  _count?: {
    subscriptions: number
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalBooks: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0
  })
  const [books, setBooks] = useState<Book[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddBookModal, setShowAddBookModal] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [viewingBook, setViewingBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Form state
  const [bookForm, setBookForm] = useState({
    title: '',
    description: '',
    category: '',
    authorId: '',
    priority: 0,
    status: 'DRAFT'
  })
  const [bookFile, setBookFile] = useState<File | null>(null)
  const [adminUserId, setAdminUserId] = useState<string>('')

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      router.push('/admin')
      return
    }
    fetchAdminUser()
    fetchData()
  }, [router, activeTab])

  const fetchAdminUser = async () => {
    try {
      // Get admin user info from localStorage or fetch from API
      // For now, we'll use a workaround - fetch current admin user
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const users = await response.json()
        const adminUser = users.find((u: User) => u.role === 'OWNER' || u.role === 'ADMIN')
        if (adminUser) {
          setAdminUserId(adminUser.id)
          // Set as default author ID
          setBookForm(prev => ({ ...prev, authorId: adminUser.id }))
        }
      }
    } catch (error) {
      console.error('Error fetching admin user:', error)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch books
      const booksRes = await fetch('/api/admin/books')
      if (booksRes.ok) {
        const booksData = await booksRes.json()
        setBooks(booksData)
        setStats(prev => ({ ...prev, totalBooks: booksData.length }))
      }

      // Fetch users
      if (activeTab === 'users') {
        const usersRes = await fetch('/api/admin/users')
        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData)
          setStats(prev => ({ ...prev, totalUsers: usersData.length }))
          
          // Calculate active subscriptions
          const activeSubs = usersData.reduce((sum: number, user: User) => 
            sum + (user._count?.subscriptions || 0), 0)
          setStats(prev => ({ ...prev, activeSubscriptions: activeSubs }))
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin')
  }

  const handleAddBook = () => {
    setBookForm({
      title: '',
      description: '',
      category: '',
      authorId: adminUserId || '',
      priority: 0,
      status: 'DRAFT'
    })
    setBookFile(null)
    setEditingBook(null)
    setShowAddBookModal(true)
  }

  const handleEditBook = (book: Book) => {
    setEditingBook(book)
    setBookForm({
      title: book.title,
      description: book.description || '',
      category: book.category,
      authorId: typeof book.author === 'object' ? book.author.id : '',
      priority: book.priority || 0,
      status: book.status
    })
    setBookFile(null)
    setShowAddBookModal(true)
  }

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!bookForm.authorId) {
      alert('Please wait for author ID to load, or enter it manually')
      return
    }
    
    try {
      const formData = new FormData()
      formData.append('title', bookForm.title)
      formData.append('description', bookForm.description)
      formData.append('category', bookForm.category)
      formData.append('authorId', bookForm.authorId)
      formData.append('priority', bookForm.priority.toString())
      formData.append('status', bookForm.status)
      if (bookFile && bookFile.size > 0) {
        formData.append('file', bookFile)
      }

      const url = editingBook 
        ? `/api/admin/books/${editingBook.id}`
        : '/api/admin/books'
      const method = editingBook ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formData
      })

      if (response.ok) {
        setShowAddBookModal(false)
        fetchData()
      } else {
        const data = await response.json()
        console.error('Error response:', data)
        alert(data.error || 'Failed to save book. Check console for details.')
      }
    } catch (error) {
      console.error('Error saving book:', error)
      alert('Failed to save book: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return

    try {
      const response = await fetch(`/api/admin/books/${bookId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
      } else {
        alert('Failed to delete book')
      }
    } catch (error) {
      console.error('Error deleting book:', error)
      alert('Failed to delete book')
    }
  }

  const handleToggleHide = async (book: Book) => {
    try {
      const response = await fetch(`/api/admin/books/${book.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHidden: !book.isHidden })
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error toggling book visibility:', error)
    }
  }

  const handleViewBook = async (bookId: string) => {
    try {
      const response = await fetch(`/api/admin/books/${bookId}`)
      if (response.ok) {
        const bookData = await response.json()
        setViewingBook(bookData)
      }
    } catch (error) {
      console.error('Error fetching book:', error)
    }
  }

  const handleBanUser = async (userId: string, days: number) => {
    if (!confirm(`Ban this user for ${days} day(s)?`)) return

    try {
      const banDate = new Date()
      banDate.setDate(banDate.getDate() + days)
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bannedUntil: banDate.toISOString()
        })
      })

      if (response.ok) {
        fetchData()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to ban user')
      }
    } catch (error) {
      console.error('Error banning user:', error)
      alert('Failed to ban user')
    }
  }

  const handleUnbanUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bannedUntil: null
        })
      })

      if (response.ok) {
        fetchData()
      } else {
        alert('Failed to unban user')
      }
    } catch (error) {
      console.error('Error unbanning user:', error)
      alert('Failed to unban user')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }

  const StatCard = ({ title, value, icon: Icon, color }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string 
  }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-gray-300 text-sm">Last 30 days</span>
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-300">{title}</p>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/10 backdrop-blur-md rounded-lg p-1 w-fit">
          {['overview', 'books', 'users', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats.totalUsers.toLocaleString()}
                icon={Users}
                color="from-blue-500 to-cyan-500"
              />
              <StatCard
                title="Total Books"
                value={stats.totalBooks}
                icon={BookOpen}
                color="from-purple-500 to-pink-500"
              />
              <StatCard
                title="Active Subscriptions"
                value={stats.activeSubscriptions}
                icon={TrendingUp}
                color="from-green-500 to-emerald-500"
              />
              <StatCard
                title="Monthly Revenue"
                value={`€${stats.monthlyRevenue.toFixed(2)}`}
                icon={DollarSign}
                color="from-orange-500 to-red-500"
              />
            </div>
          </motion.div>
        )}

        {/* Books Tab */}
        {activeTab === 'books' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Books Management</h2>
              <Button 
                onClick={handleAddBook}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Book
              </Button>
            </div>

            {loading ? (
              <div className="text-center text-white py-8">Loading...</div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Author</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {books.map((book) => (
                        <tr key={book.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-white">{book.title}</td>
                          <td className="px-6 py-4 text-gray-300">
                            {typeof book.author === 'object' ? book.author.username : book.author}
                          </td>
                          <td className="px-6 py-4 text-gray-300">{book.category}</td>
                          <td className="px-6 py-4 text-gray-300">{book.priority || 0}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                book.status === 'PUBLISHED' 
                                  ? 'bg-green-500/20 text-green-300' 
                                  : 'bg-yellow-500/20 text-yellow-300'
                              }`}>
                                {book.status}
                              </span>
                              {book.isHidden && (
                                <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-300">
                                  Hidden
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-white hover:bg-white/10"
                                onClick={() => handleViewBook(book.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-white hover:bg-white/10"
                                onClick={() => handleEditBook(book)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className={book.isHidden ? "text-green-400 hover:bg-green-500/20" : "text-gray-400 hover:bg-gray-500/20"}
                                onClick={() => handleToggleHide(book)}
                                title={book.isHidden ? "Show book" : "Hide book"}
                              >
                                {book.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-red-400 hover:bg-red-500/20"
                                onClick={() => handleDeleteBook(book.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-white">Users Management</h2>
            
            {loading ? (
              <div className="text-center text-white py-8">Loading...</div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Subscriptions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {users.map((user) => {
                        const isBanned = user.bannedUntil && new Date(user.bannedUntil) > new Date()
                        return (
                          <tr key={user.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 text-white">{user.username}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.role === 'OWNER' || user.role === 'ADMIN'
                                  ? 'bg-purple-500/20 text-purple-300'
                                  : 'bg-blue-500/20 text-blue-300'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {isBanned ? (
                                <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-300">
                                  Banned until {new Date(user.bannedUntil!).toLocaleDateString()}
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-300">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-gray-300">{user._count?.subscriptions || 0}</td>
                            <td className="px-6 py-4 text-gray-300">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              {user.role !== 'OWNER' && user.role !== 'ADMIN' && (
                                <div className="flex items-center space-x-2">
                                  {isBanned ? (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-green-400 hover:bg-green-500/20"
                                      onClick={() => handleUnbanUser(user.id)}
                                      title="Unban user"
                                    >
                                      <Unlock className="w-4 h-4" />
                                    </Button>
                                  ) : (
                                    <div className="relative group">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-yellow-400 hover:bg-yellow-500/20"
                                        title="Ban user"
                                      >
                                        <Ban className="w-4 h-4" />
                                      </Button>
                                      <div className="absolute left-0 top-full mt-1 bg-purple-900 border border-white/20 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                        <div className="py-1">
                                          <button
                                            onClick={() => handleBanUser(user.id, 1)}
                                            className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10"
                                          >
                                            1 Day
                                          </button>
                                          <button
                                            onClick={() => handleBanUser(user.id, 5)}
                                            className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10"
                                          >
                                            5 Days
                                          </button>
                                          <button
                                            onClick={() => handleBanUser(user.id, 10)}
                                            className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10"
                                          >
                                            10 Days
                                          </button>
                                          <button
                                            onClick={() => handleBanUser(user.id, 20)}
                                            className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10"
                                          >
                                            20 Days
                                          </button>
                                          <button
                                            onClick={() => handleBanUser(user.id, 30)}
                                            className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10"
                                          >
                                            30 Days
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-400 hover:bg-red-500/20"
                                    onClick={() => handleDeleteUser(user.id)}
                                    title="Delete user"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-white">Settings</h2>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <p className="text-gray-300">Settings coming soon...</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add/Edit Book Modal */}
      {showAddBookModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl border border-white/20 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </h2>
              <Button
                variant="ghost"
                onClick={() => setShowAddBookModal(false)}
                className="text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                <textarea
                  required
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                <input
                  type="text"
                  required
                  value={bookForm.category}
                  onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Author ID *</label>
                <input
                  type="text"
                  required
                  value={bookForm.authorId}
                  onChange={(e) => setBookForm({ ...bookForm, authorId: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={adminUserId || 'Loading...'}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {adminUserId ? `Admin User ID: ${adminUserId}` : 'Enter the user ID of the author'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                  <input
                    type="number"
                    value={bookForm.priority}
                    onChange={(e) => setBookForm({ ...bookForm, priority: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status *</label>
                  <select
                    value={bookForm.status}
                    onChange={(e) => setBookForm({ ...bookForm, status: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="DRAFT" className="bg-purple-900">DRAFT</option>
                    <option value="PUBLISHED" className="bg-purple-900">PUBLISHED</option>
                    <option value="ARCHIVED" className="bg-purple-900">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  PDF File {!editingBook && '*'}
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setBookFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddBookModal(false)}
                  className="text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingBook ? 'Update' : 'Create'} Book
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Book Modal */}
      {viewingBook && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl border border-white/20 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{viewingBook.title}</h2>
              <Button
                variant="ghost"
                onClick={() => setViewingBook(null)}
                className="text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4 text-white">
              <div>
                <span className="text-gray-300">Author: </span>
                <span>{typeof viewingBook.author === 'object' ? viewingBook.author.username : viewingBook.author}</span>
              </div>
              <div>
                <span className="text-gray-300">Category: </span>
                <span>{viewingBook.category}</span>
              </div>
              <div>
                <span className="text-gray-300">Status: </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  viewingBook.status === 'PUBLISHED' 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {viewingBook.status}
                </span>
              </div>
              {viewingBook.priority !== undefined && (
                <div>
                  <span className="text-gray-300">Priority: </span>
                  <span>{viewingBook.priority}</span>
                </div>
              )}
              <div>
                <span className="text-gray-300">Description: </span>
                <p className="mt-2 text-gray-200">{viewingBook.description}</p>
              </div>
              {viewingBook.fileUrl && (
                <div>
                  <a 
                    href={viewingBook.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    View PDF
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
