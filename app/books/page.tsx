'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { BookOpen, Search, Filter, Star } from 'lucide-react'
import Link from 'next/link'

interface Book {
  id: string
  title: string
  author: string
  price: number
  coverImage: string
  rating: number
  category: string
  description: string
}

const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Digital Revolution',
    author: 'Sarah Johnson',
    price: 19.99,
    coverImage: '/api/placeholder/300/400',
    rating: 4.8,
    category: 'Technology',
    description: 'Exploring the impact of digital transformation on modern society.'
  },
  {
    id: '2',
    title: 'Mindful Living',
    author: 'Michael Chen',
    price: 15.99,
    coverImage: '/api/placeholder/300/400',
    rating: 4.6,
    category: 'Self-Help',
    description: 'A practical guide to incorporating mindfulness into daily life.'
  },
  {
    id: '3',
    title: 'The Art of Code',
    author: 'Emily Rodriguez',
    price: 24.99,
    coverImage: '/api/placeholder/300/400',
    rating: 4.9,
    category: 'Programming',
    description: 'Master the craft of software development with best practices.'
  },
  {
    id: '4',
    title: 'Business Strategy 2024',
    author: 'David Thompson',
    price: 29.99,
    coverImage: '/api/placeholder/300/400',
    rating: 4.7,
    category: 'Business',
    description: 'Modern strategies for thriving in today\'s competitive market.'
  },
  {
    id: '5',
    title: 'Data Science Fundamentals',
    author: 'Lisa Wang',
    price: 22.99,
    coverImage: '/api/placeholder/300/400',
    rating: 4.5,
    category: 'Technology',
    description: 'Learn the fundamentals of data science and machine learning.'
  },
  {
    id: '6',
    title: 'Creative Writing',
    author: 'James Miller',
    price: 18.99,
    coverImage: '/api/placeholder/300/400',
    rating: 4.4,
    category: 'Writing',
    description: 'Unlock your creative potential with proven writing techniques.'
  },
  {
    id: '7',
    title: 'Web Development Mastery',
    author: 'Alex Kumar',
    price: 27.99,
    coverImage: '/api/placeholder/300/400',
    rating: 4.8,
    category: 'Programming',
    description: 'Complete guide to modern web development technologies.'
  },
  {
    id: '8',
    title: 'Marketing Psychology',
    author: 'Sophie Brown',
    price: 21.99,
    coverImage: '/api/placeholder/300/400',
    rating: 4.6,
    category: 'Business',
    description: 'Understanding consumer behavior and marketing strategies.'
  }
]

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>(mockBooks)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('title')

  const categories = ['All', 'Technology', 'Self-Help', 'Programming', 'Business', 'Writing']
  
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'rating':
        return b.rating - a.rating
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Browse Books
          </h1>
          <p className="text-lg text-gray-600">
            Discover your next favorite book from our collection
          </p>
        </motion.div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search books or authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="title">Sort by Title</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredBooks.length} of {books.length} books
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative">
                  <div className="aspect-w-3 aspect-h-4 bg-gray-200">
                    <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-blue-600" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-sm font-semibold text-blue-600">
                    ${book.price}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                  
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(book.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{book.rating}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {book.description}
                  </p>
                  
                  <div className="flex gap-2">
                    <Link href={`/books/${book.id}`} className="flex-1">
                      <Button size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline">
                      <BookOpen className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
