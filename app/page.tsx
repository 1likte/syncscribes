'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Facebook, Instagram, Music2, Send, BookOpen, Star, Clock } from 'lucide-react'
import AIHero from '@/components/AIHero'

interface Book {
    id: string
    title: string
    coverImage?: string
    category?: { name: string }
    author: {
        username: string
    } | string
    averageRating?: number
    views: number
    reads: number
    createdAt: string
}

export default function Home() {
    const { data: session } = useSession()
    const router = useRouter()
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        fetchData();
        return () => window.removeEventListener('resize', checkMobile);
    }, [])

    const fetchData = async () => {
        try {
            const res = await fetch('/api/books?limit=100&preview=true')
            const data = await res.json()
            setBooks(Array.isArray(data) ? data : (data.books || []))
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const transformBooks = (bookList: Book[]) => {
        return bookList.map(book => ({
            id: book.id,
            title: book.title,
            coverImage: book.coverImage || '/api/placeholder/300/450',
            category: typeof book.category === 'object' ? book.category.name : (book as any).category || 'Uncategorized',
            author: typeof book.author === 'object' ? book.author.username : book.author,
            rating: book.averageRating || 4.5,
            views: book.views || 0,
            reads: book.reads || 0,
            progress: 0
        }))
    }

    const sortedBooks = [...books].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const feedBooks = transformBooks(sortedBooks);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-foreground/40 font-bold italic tracking-widest uppercase text-xs">Assembling Your Archive...</p>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-transparent">
            {/* Hero Section */}
            <AIHero newestBooks={feedBooks.slice(0, 4)} />

            <div className="container mx-auto px-6 py-20">
                {/* Unified Book Grid removed as requested */}
            </div>
        </main>
    )
}
