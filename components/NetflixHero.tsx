'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FeaturedBook {
  id: string
  title: string
  description: string
  coverImage: string
  category: string
  author: string
}

const mockFeaturedBooks: FeaturedBook[] = [
  {
    id: '1',
    title: 'The Digital Revolution',
    description: 'Explore how technology is reshaping our world in this comprehensive guide to digital transformation.',
    coverImage: '/api/placeholder/1920/1080',
    category: 'Technology',
    author: 'Sarah Johnson'
  },
  {
    id: '2',
    title: 'Mindful Living',
    description: 'Discover the power of mindfulness and transform your daily experience with practical techniques.',
    coverImage: '/api/placeholder/1920/1080',
    category: 'Self-Help',
    author: 'Michael Chen'
  },
  {
    id: '3',
    title: 'Business Strategy 2024',
    description: 'Navigate the modern business landscape with cutting-edge strategies and insights.',
    coverImage: '/api/placeholder/1920/1080',
    category: 'Business',
    author: 'Emma Williams'
  }
]

export default function NetflixHero() {
  const [currentBook, setCurrentBook] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentBook((prev) => (prev + 1) % mockFeaturedBooks.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [isHovered])

  const nextBook = () => {
    setCurrentBook((prev) => (prev + 1) % mockFeaturedBooks.length)
  }

  const prevBook = () => {
    setCurrentBook((prev) => (prev - 1 + mockFeaturedBooks.length) % mockFeaturedBooks.length)
  }

  const book = mockFeaturedBooks[currentBook]

  return (
    <div 
      className="relative h-screen overflow-hidden bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-8">
          <motion.div
            key={currentBook}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-6xl font-bold text-white mb-4 leading-tight">
              {book.title}
            </h1>
            <p className="text-xl text-gray-200 mb-6 leading-relaxed">
              {book.description}
            </p>
            <div className="flex items-center space-x-4 mb-8">
              <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium">
                {book.category}
              </span>
              <span className="text-gray-300">
                by {book.author}
              </span>
            </div>
            <div className="flex space-x-4">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 px-8 py-3">
                <Play className="w-5 h-5 mr-2" />
                Read Now
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-3">
                <Info className="w-5 h-5 mr-2" />
                More Info
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevBook}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextBook}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {mockFeaturedBooks.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBook(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentBook 
                ? 'bg-white w-8' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
