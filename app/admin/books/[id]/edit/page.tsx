'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
    BookOpen,
    Upload,
    Image as ImageIcon,
    Loader2,
    Save,
    ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

const bookCategories = [
    'Fantasy', 'Sci-Fi', 'Romance', 'Mystery', 'Thriller', 'Horror',
    'Historical', 'Biography', 'Self-Help', 'Poetry', 'Classics',
    'Adventure', 'Drama', 'Psychology', 'Philosophy', 'Science'
];

export default function EditBookPage() {
    const router = useRouter()
    const { id } = useParams()
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [book, setBook] = useState<any>(null)

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const res = await fetch(`/api/books/${id}`)
                if (!res.ok) throw new Error('Book not found')
                const data = await res.json()
                setBook(data)
            } catch (error) {
                console.error('Fetch error:', error)
                alert('Failed to load book data.')
                router.push('/admin/books')
            } finally {
                setIsLoading(false)
            }
        }
        if (id) fetchBook()
    }, [id])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsSaving(true)

        const formData = new FormData(e.currentTarget)
        const title = formData.get('title') as string
        const category = formData.get('category') as string
        const coverFile = formData.get('cover') as File
        const pdfFile = formData.get('pdf') as File

        try {
            let coverUrl = book.coverImage
            if (coverFile && coverFile.size > 0) {
                const coverFormData = new FormData();
                coverFormData.append('file', coverFile);
                coverFormData.append('type', 'cover');
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: coverFormData });

                if (!uploadRes.ok) {
                    const errorText = await uploadRes.text();
                    console.error('Upload error response:', errorText);
                    throw new Error('Failed to upload cover image. Server error.');
                }

                const data = await uploadRes.json();
                coverUrl = data.url;
            }

            let pdfUrl = book.fileUrl
            if (pdfFile && pdfFile.size > 0) {
                const pdfFormData = new FormData();
                pdfFormData.append('file', pdfFile);
                pdfFormData.append('type', 'pdf');
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: pdfFormData });

                if (!uploadRes.ok) {
                    throw new Error('Failed to upload PDF file.');
                }

                const data = await uploadRes.json();
                pdfUrl = data.url;
            }

            const res = await fetch(`/api/books/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description: formData.get('description'),
                    categoryId: category,
                    coverImage: coverUrl,
                    fileUrl: pdfUrl,
                    status: 'PUBLISHED'
                })
            })

            if (res.ok) {
                router.push('/admin/books')
            } else {
                const errorData = await res.json().catch(() => ({ message: 'A server error occurred.' }));
                throw new Error(errorData.message || 'Update failed.');
            }
        } catch (error: any) {
            alert(error.message)
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-purple-600" size={40} />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Book Data...</p>
        </div>
    )

    if (!book) return null

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/admin/books">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                </Link>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Edit <span className="text-purple-600">Book</span>
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Book Title</label>
                    <input name="title" defaultValue={book.title} required className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Category</label>
                    <select name="category" defaultValue={book.category?.name || book.category} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-purple-500 outline-none">
                        {bookCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Synopsis</label>
                    <textarea name="description" defaultValue={book.description} rows={4} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-purple-500 outline-none resize-none" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Cover Image</label>
                        <div className="bg-slate-50 dark:bg-black/20 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-4 text-center hover:border-purple-500 transition-colors cursor-pointer relative group">
                            {book.coverImage && <img src={book.coverImage} className="w-full h-32 object-cover rounded-lg mb-2 opacity-50" />}
                            <ImageIcon className="mx-auto text-slate-400 mb-2 group-hover:text-purple-500 transition-colors" size={24} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Change Cover</span>
                            <input type="file" name="cover" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">PDF File</label>
                        <div className="bg-slate-50 dark:bg-black/20 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-4 text-center hover:border-red-500 transition-colors cursor-pointer relative group">
                            {book.fileUrl && <div className="text-[10px] font-bold text-green-500 mb-2">Current PDF exists</div>}
                            <Upload className="mx-auto text-slate-400 mb-2 group-hover:text-red-500 transition-colors" size={24} />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Change PDF</span>
                            <input type="file" name="pdf" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>
                </div>

                <button
                    disabled={isSaving}
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-purple-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    Update Book
                </button>
            </form>
        </div>
    )
}
