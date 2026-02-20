'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { BookOpen, Star, Clock } from 'lucide-react'
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
  }
]

export default function FeaturedBooks() {
  const [books, setBooks] = useState<Book[]>(mockBooks)
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', 'Technology', 'Self-Help', 'Programming', 'Business']
  
  const filteredBooks = selectedCategory === 'All' 
    ? books 
    : books.filter(book => book.category === selectedCategory)

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Featured Books
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of must-read titles from various genres
          </p>
        </motion.div>

        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="mb-2"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredBooks.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
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

        <div className="text-center mt-12">
          <Link href="/books">
            <Button size="lg" variant="outline">
              View All Books
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
