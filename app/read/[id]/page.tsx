'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { usePaywall } from '@/hooks/usePaywall'

const PDFReader = dynamic(() => import('@/components/reader/PDFReader'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-[#0a0a0c] flex flex-col items-center justify-center gap-6 z-[200]">
      <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-white font-black italic tracking-[0.3em] uppercase text-xl">SyncScribes Immersive</h2>
        <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Preparing your reading environment...</p>
      </div>
    </div>
  )
})

interface Book {
  id: string
  title: string
  content?: string
  fileUrl?: string
  author: {
    username: string
  } | string
}

export default function ReaderPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { triggerPaywall, isSubscribed } = usePaywall()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookDetails()

    if (status !== 'loading' && !isSubscribed) {
      triggerPaywall(5)
    }
  }, [params.id, session, status, isSubscribed])

  const fetchBookDetails = async () => {
    try {
      const res = await fetch(`/api/books/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setBook(data);
        // Analytics read counter
        fetch(`/api/books/${params.id}`, { method: 'POST' }).catch(console.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return null; // Handled by dynamic loading state

  if (!book) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-6">
      <h1 className="text-4xl font-black text-white italic tracking-tighter">DATA NOT FOUND</h1>
      <Link href="/browse" className="px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs">Return to Library</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      {book.fileUrl ? (
        <PDFReader fileUrl={book.fileUrl} bookId={book.id} />
      ) : (
        <div className="max-w-3xl mx-auto py-20 px-8 bg-white/[0.02] min-h-screen border-x border-white/5">
          <div className="mb-12">
            <h1 className="text-4xl font-black text-white mb-2">{book.title}</h1>
            <p className="text-primary font-bold uppercase tracking-widest text-xs">
              {typeof book.author === 'object' ? book.author.username : book.author}
            </p>
          </div>
          <div className="prose prose-invert prose-lg max-w-none text-white/80 leading-[2] font-serif">
            {book.content || "This book appears to be empty."}
          </div>
        </div>
      )}
    </div>
  )
}
