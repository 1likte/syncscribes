'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, Heart, BookOpen, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { usePaywall } from '@/hooks/usePaywall'


interface Book {
  id: string
  title: string
  coverImage: string
  category: string
  author: string
  rating: number
  progress?: number
}

interface AIRowProps {
  title: string
  books: Book[]
  gradient?: string
}

export default function AIRow({ title, books, gradient = "from-pink-500/20 to-purple-500/20" }: AIRowProps) {
  const [scrollPosition, setScrollPosition] = useState(0)
  const scrollAmount = 320
  const router = useRouter()
  const { triggerPaywall, isSubscribed } = usePaywall()

  const scrollLeft = () => {
    const newPosition = Math.max(0, scrollPosition - scrollAmount)
    setScrollPosition(newPosition)
  }

  const scrollRight = () => {
    const maxScroll = (books.length - 3) * 320 // 3 books visible on desktop
    const newPosition = Math.min(maxScroll, scrollPosition + scrollAmount)
    setScrollPosition(newPosition)
  }

  const handleReadBook = (bookId: string) => {
    router.push(`/read/${bookId}`)
    if (!isSubscribed) {
      triggerPaywall(5)
    }
  }


  return (
    <div className="relative mb-12">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
          <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {title}
          </span>
        </h2>
        <div className={`h-1 w-24 bg-gradient-to-r ${gradient} rounded-full`} />
      </motion.div>

      {/* Scroll Container */}
      <div className="relative group">
        {/* Left Arrow */}
        {scrollPosition > 0 && (
          <motion.button
            onClick={scrollLeft}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 bg-gradient-to-r from-background via-background/80 to-transparent text-foreground p-3 rounded-r-full hover:from-background transition-all shadow-xl"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
        )}

        {/* Right Arrow */}
        {scrollPosition < (books.length - 3) * 320 && (
          <motion.button
            onClick={scrollRight}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 bg-gradient-to-l from-background via-background/80 to-transparent text-foreground p-3 rounded-l-full hover:from-background transition-all shadow-xl"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        )}

        {/* Books Container */}
        <div className="overflow-hidden">
          <motion.div
            className="flex space-x-6 px-4"
            animate={{ x: -scrollPosition }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                className="flex-shrink-0 w-72"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative group/book">
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-0 group-hover/book:opacity-60 transition-all duration-500`} />

                  {/* Book Card */}
                  <div className="relative bg-card backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300 shadow-lg group-hover/book:shadow-primary/10">
                    {/* Cover */}
                    <div className="relative h-64 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />

                      {/* Floating Icon */}
                      <motion.div
                        animate={{
                          y: [0, -10, 0],
                          rotate: [0, 5, 0],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      >
                        <BookOpen className="w-16 h-16 text-primary/30" />
                      </motion.div>

                      {/* Progress Bar */}
                      {book.progress && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                          <div
                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                            style={{ width: `${book.progress}%` }}
                          />
                        </div>
                      )}

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover/book:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <div className="flex space-x-3">
                          <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90 shadow-lg" onClick={() => handleReadBook(book.id)}>
                            <Play className="w-4 h-4 mr-1" />
                            Read
                          </Button>
                          <Button size="sm" variant="outline" className="bg-background/50 backdrop-blur-md text-foreground hover:bg-secondary">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-foreground mb-1 truncate">{book.title}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{book.author}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Sparkles className="w-4 h-4 text-yellow-500" />
                          <span className="text-foreground text-sm font-medium">{book.rating}</span>
                        </div>
                        <span className={`px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold`}>
                          {book.category}
                        </span>
                      </div>
                    </div>
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
