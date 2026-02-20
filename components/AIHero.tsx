'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Brain, Zap, Star, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Book {
  id: string
  title: string
  coverImage?: string
  author: { username: string } | string
  category?: { name: string } | string
  averageRating?: number
}

interface HeroProps {
  newestBooks?: Book[]
}

export default function AIHero({ newestBooks = [] }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const router = useRouter()

  useEffect(() => {
    if (newestBooks.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newestBooks.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [newestBooks])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const currentBook = newestBooks[currentIndex]

  // Fallback if no books are loaded yet
  const displayBook = currentBook || {
    id: 'cmlqmv8fz000ij2gbdy2avbi7',
    title: 'k',
    coverImage: '',
    author: 'Admin',
    averageRating: 5.0,
    category: 'Literature'
  }

  return (
    <div className="relative min-h-[100dvh] bg-transparent">
      {/* Absolute Top Glow */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent z-0 pointer-events-none" />

      {/* Animated Background - Hidden on small mobile for performance */}
      <div className="absolute inset-0 overflow-hidden hidden sm:block pointer-events-none" style={{ WebkitBackfaceVisibility: 'hidden' }}>
        <motion.div
          className="absolute w-96 h-96 bg-pink-500 rounded-full blur-3xl opacity-30"
          animate={{ x: mousePosition.x * 0.05, y: mousePosition.y * 0.05 }}
          style={{ left: '10%', top: '20%' }}
        />
        <motion.div
          className="absolute w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-30"
          animate={{ x: mousePosition.x * -0.05, y: mousePosition.y * -0.05 }}
          style={{ right: '15%', top: '60%' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-[100dvh] flex items-start md:items-center pt-12 md:pt-24 pb-12">
        <div className="container mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl lg:text-8xl font-black text-foreground mb-8 lg:mb-12 leading-[1.1] tracking-tighter"
              >
                FUTURE OF <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient-x">
                  READING IS HERE
                </span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center lg:justify-start"
              >
                <Link href="/browse">
                  <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 lg:px-10 py-6 lg:py-7 text-base lg:text-lg group rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95">
                    <Brain className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Start Reading
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right Content - The Showcase Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="relative order-1 lg:order-2 flex justify-center"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={displayBook.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="relative group cursor-pointer w-full max-w-[400px]"
                  onClick={() => router.push(`/read/${displayBook.id}`)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />

                  <div className="relative bg-card/40 backdrop-blur-xl rounded-[2.5rem] p-6 lg:p-8 shadow-2xl border border-white/10 group-hover:border-white/20 transition-colors">
                    <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl mb-6 flex items-center justify-center overflow-hidden shadow-inner">
                      {displayBook.coverImage && !displayBook.coverImage.includes('placeholder') ? (
                        <img
                          src={displayBook.coverImage}
                          alt={displayBook.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-4 text-primary/40">
                          <Brain className="w-12 h-12 lg:w-16 lg:h-16" />
                          <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full text-center">No Preview</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl lg:text-2xl font-bold text-white mb-1 line-clamp-1 italic uppercase tracking-tighter transition-all group-hover:text-primary">
                          {displayBook.title}
                        </h3>
                        <p className="text-white/40 uppercase text-[9px] font-black tracking-widest leading-none">
                          {typeof displayBook.author === 'object' ? displayBook.author.username : (displayBook.author || 'Author')}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-white text-xs lg:text-sm font-black tracking-tighter">{displayBook.averageRating || 5.0}</span>
                        </div>
                        <span className="text-primary text-[9px] font-black uppercase tracking-[0.2em] bg-primary/10 px-2 py-0.5 rounded-full">
                          {typeof displayBook.category === 'object' ? displayBook.category.name : (displayBook.category || 'Featured')}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px] -z-10 animate-pulse hidden sm:block" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px] -z-10 animate-pulse hidden sm:block" />
    </div>
  )
}
