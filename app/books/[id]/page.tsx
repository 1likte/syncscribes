'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { BookOpen, Star, DollarSign, Download, Heart, Share2, User, Calendar, Lock, Crown, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Book {
  id: string
  title: string
  description: string
  price: number
  coverImage: string
  fileUrl?: string
  isbn?: string
  pageCount?: number
  language: string
  category: string
  tags: string[]
  status: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    username: string
  }
  reviews: {
    id: string
    rating: number
    comment?: string
    user: {
      username: string
    }
    createdAt: string
  }[]
  purchases?: {
    id: string
    status: string
    createdAt: string
  }[]
}

const mockBook: Book = {
  id: '1',
  title: 'The Digital Revolution',
  description: 'The Digital Revolution explores the profound impact of digital transformation on modern society. This comprehensive guide examines how technology is reshaping industries, economies, and human interactions in the 21st century. From artificial intelligence to blockchain, from social media to the Internet of Things, this book provides insights into the technologies driving change and their implications for businesses, governments, and individuals. Written in an accessible style, it offers both technical understanding and strategic perspectives for navigating the digital landscape.',
  price: 19.99,
  coverImage: '/api/placeholder/600/800',
  isbn: '978-1-234567-89-0',
  pageCount: 350,
  language: 'English',
  category: 'Technology',
  tags: ['Technology', 'Digital Transformation', 'AI', 'Future', 'Innovation'],
  status: 'PUBLISHED',
  createdAt: '2024-01-15',
  updatedAt: '2024-01-20',
  author: {
    id: '1',
    username: 'sarahjohnson'
  },
  reviews: [
    {
      id: '1',
      rating: 5,
      comment: 'Excellent book! Very insightful and well-written.',
      user: {
        username: 'techenthusiast'
      },
      createdAt: '2024-01-16'
    },
    {
      id: '2',
      rating: 4,
      comment: 'Great overview of digital transformation trends.',
      user: {
        username: 'businessreader'
      },
      createdAt: '2024-01-18'
    }
  ]
}

export default function BookDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [book, setBook] = useState<Book>(mockBook)
  const [isLoading, setIsLoading] = useState(false)
  const [isPurchased, setIsPurchased] = useState(false)
  const [canViewContent, setCanViewContent] = useState(false)
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false)
  const [contentViewTime, setContentViewTime] = useState(0)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    // Burada kitap detaylarını API'den çekeceğiz
    // Şimdilik mock veri kullanıyoruz
  }, [params.id])

  useEffect(() => {
    // Kullanıcının bu kitabı satın alıp almadığını kontrol et
    if (session && book.purchases) {
      const purchased = book.purchases.some(purchase =>
        purchase.status === 'COMPLETED'
      )
      setIsPurchased(purchased)
      setCanViewContent(purchased)
    }

    // Fetch like status
    if (session && params.id) {
      fetch(`/api/books/progress?bookId=${params.id}`)
        .then(res => res.json())
        .then(data => setIsLiked(data.isLiked || false))
        .catch(() => { });
    }
  }, [session, book.purchases, params.id])

  useEffect(() => {
    // 3 saniye sonra premium prompt göster
    if (canViewContent && !session) {
      const timer = setInterval(() => {
        setContentViewTime(prev => {
          if (prev >= 3) {
            setShowPremiumPrompt(true)
            clearInterval(timer)
            return 3
          }
          return prev + 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [canViewContent, session])

  const handleReadContent = () => {
    if (!session) {
      setCanViewContent(true)
    } else {
      setCanViewContent(true)
    }
  }


  const toggleLike = async () => {
    if (!session || !params.id) return;
    try {
      const newStatus = !isLiked;
      await fetch('/api/books/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: params.id, isLiked: newStatus })
      });
      setIsLiked(newStatus);
    } catch (e) {
      console.error(e);
    }
  };

  const averageRating = book.reviews.length > 0
    ? book.reviews.reduce((sum, review) => sum + review.rating, 0) / book.reviews.length
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-96 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <BookOpen className="w-32 h-32 text-blue-600" />
              </div>

              <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{book.title}</h1>

                <div className="flex items-center space-x-6 mb-6">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">by {book.author.username}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">{new Date(book.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 mr-1" />
                    <span className="text-gray-600">{averageRating.toFixed(1)} ({book.reviews.length} reviews)</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {book.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="prose max-w-none mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>

                  {!canViewContent ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-gray-700 mb-2">Content Locked</h4>
                      <p className="text-gray-600 mb-6">Sign in to read this book's content</p>
                      <Button onClick={handleReadContent} className="bg-blue-600 hover:bg-blue-700">
                        Read Content
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <p className="text-gray-600 leading-relaxed">{book.description}</p>

                      {/* Timer display for non-logged-in users */}
                      {!session && (
                        <div className="absolute top-0 right-0 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                          {3 - contentViewTime}s remaining
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {book.isbn && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <span className="text-sm text-gray-500">ISBN:</span>
                      <p className="font-medium">{book.isbn}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Pages:</span>
                      <p className="font-medium">{book.pageCount}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Language:</span>
                      <p className="font-medium">{book.language}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Category:</span>
                      <p className="font-medium">{book.category}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-4">
                  <div className="flex-1 text-center py-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-700 font-medium">Free Access - No Payment Required</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleLike}
                    className={isLiked ? 'text-rose-500 border-rose-200 bg-rose-50' : ''}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>

              {book.reviews.length > 0 ? (
                <div className="space-y-6">
                  {book.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">{review.user.username}</span>
                          <div className="flex items-center ml-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600 mt-2">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No reviews yet. Be the first to review this book!</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-green-600 mb-2">FREE</div>
                <div className="flex items-center justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                        }`}
                    />
                  ))}
                  <span className="ml-2 text-gray-600">({averageRating.toFixed(1)})</span>
                </div>
              </div>

              <div className="w-full mb-4 bg-green-50 border border-green-200 rounded-lg py-4">
                <span className="text-green-700 font-semibold text-center block">Free Access</span>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Book Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium">Digital</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pages:</span>
                    <span className="font-medium">{book.pageCount || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Language:</span>
                    <span className="font-medium">{book.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{book.category}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Author</h3>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{book.author.username}</p>
                    <p className="text-sm text-gray-600">Author</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Premium Prompt Overlay */}
      <AnimatePresence>
        {showPremiumPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Crown className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">Upgrade to Premium</h3>

                <p className="text-gray-600 mb-6">
                  Your 3-second preview has ended! Sign up for free to continue reading this book and get access to our entire library.
                </p>

                <div className="space-y-3">
                  <Link href="/auth/signin">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center"
                    >
                      Sign Up for Free
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </motion.div>
                  </Link>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPremiumPrompt(false)}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200"
                  >
                    Maybe Later
                  </motion.button>
                </div>

                <p className="text-xs text-gray-500 mt-6">
                  No credit card required • Cancel anytime • Full access to all books
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
