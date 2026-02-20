'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Book {
  id: string
  title: string
  coverImage: string
  category: string
  author: string
}

interface NetflixRowProps {
  title: string
  books: Book[]
  category?: string
}

export default function NetflixRow({ title, books, category }: NetflixRowProps) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const scrollAmount = 300

  const scrollLeft = () => {
    const newPosition = Math.max(0, scrollPosition - scrollAmount)
    setScrollPosition(newPosition)
  }

  const scrollRight = () => {
    const maxScroll = (books.length - 4) * 250 // 4 books visible, 250px each
    const newPosition = Math.min(maxScroll, scrollPosition + scrollAmount)
    setScrollPosition(newPosition)
  }

  return (
    <div className="relative mb-8">
      <h2 className="text-2xl font-bold text-white mb-4 px-8">{title}</h2>
      
      <div className="relative group">
        {/* Left Arrow */}
        {scrollPosition > 0 && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Right Arrow */}
        {scrollPosition < (books.length - 4) * 250 && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Books Container */}
        <div className="overflow-hidden">
          <motion.div
            className="flex space-x-4 px-8"
            animate={{ x: -scrollPosition }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                className="flex-shrink-0 w-60 group/book"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
              >
                <div className="relative">
                  {/* Book Cover */}
                  <div className="relative h-80 bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/book:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover/book:opacity-100 transition-all duration-300 transform translate-y-4 group-hover/book:translate-y-0">
                        <div className="flex space-x-2 mb-4">
                          <Button size="sm" className="bg-white text-black hover:bg-gray-200">
                            <Play className="w-4 h-4 mr-1" />
                            Play
                          </Button>
                          <Button size="sm" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                            <Info className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="mt-2">
                    <h3 className="text-white font-medium truncate">{book.title}</h3>
                    <p className="text-gray-400 text-sm">{book.author}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
