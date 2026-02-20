'use client'

import { useState, useEffect } from 'react'
import { MoreHorizontal, BookOpen, Plus, Trash2, Edit2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminBooksPage() {
    const [books, setBooks] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const fetchBooks = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/books')
            const data = await res.json()
            setBooks(data)
        } catch (error) {
            console.error('Failed to fetch books:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchBooks()
    }, [])

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return

        try {
            const res = await fetch(`/api/books/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setBooks(books.filter(b => b.id !== id))
            } else {
                alert('Failed to delete book')
            }
        } catch (error) {
            console.error('Delete error:', error)
            alert('Error deleting book')
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Book <span className="text-purple-600">Collection</span>
                </h1>
                <Link href="/admin/books/new">
                    <button className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-600/20 transition-all active:scale-95">
                        <Plus size={16} />
                        Add New Book
                    </button>
                </Link>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-purple-600" size={40} />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Library...</p>
                </div>
            ) : books.length === 0 ? (
                <div className="bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 p-20 text-center">
                    <BookOpen size={48} className="mx-auto text-slate-300 dark:text-white/10 mb-4" />
                    <p className="text-slate-500 dark:text-white/40 font-bold">No books found in the collection.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {books.map((book) => (
                        <div key={book.id} className="relative group bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-xl hover:translate-y-[-5px] transition-all duration-300">
                            {/* Status Badge */}
                            <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/60 backdrop-blur-md text-white border border-white/10 ${book.status === 'PUBLISHED' ? 'text-green-400 border-green-500/50' :
                                book.status === 'PENDING' ? 'text-amber-400 border-amber-500/50' : 'text-slate-400'
                                }`}>
                                {book.status}
                            </div>

                            {/* Cover Image Placeholder */}
                            <div className="h-48 bg-slate-100 dark:bg-black/40 flex items-center justify-center text-slate-300 dark:text-white/10 relative overflow-hidden">
                                {book.coverImage ? (
                                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <BookOpen size={48} className="animate-pulse" />
                                )}
                                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
                            </div>

                            <div className="p-6 relative">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white line-clamp-1 mb-1 group-hover:text-purple-500 transition-colors">
                                    {book.title}
                                </h3>
                                <p className="text-xs font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest mb-4 flex items-center gap-1">
                                    by {book.author?.username || 'Unknown'}
                                </p>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                    <span className="text-xs font-medium text-slate-400">
                                        {new Date(book.createdAt).toLocaleDateString()}
                                    </span>
                                    <div className="flex gap-1">
                                        <Link href={`/admin/books/${book.id}/edit`}>
                                            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-blue-500 transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(book.id, book.title)}
                                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
