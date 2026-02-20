'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
    BookOpen,
    Upload,
    Image as ImageIcon,
    Loader2,
    CheckCircle2
} from 'lucide-react'

const bookCategories = [
    'Fantasy', 'Sci-Fi', 'Romance', 'Mystery', 'Thriller', 'Horror',
    'Historical', 'Biography', 'Self-Help', 'Poetry', 'Classics',
    'Adventure', 'Drama', 'Psychology', 'Philosophy', 'Science'
];

export default function NewBookPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const title = formData.get('title') as string
        const category = formData.get('category') as string
        const coverFile = formData.get('cover') as File
        const pdfFile = formData.get('pdf') as File

        if (!session?.user?.id) {
            alert('Please sign in to publish a book.');
            setIsLoading(false);
            return;
        }

        try {
            // 1. Upload Cover
            let coverUrl = ''
            if (coverFile.size > 0) {
                const coverFormData = new FormData();
                coverFormData.append('file', coverFile);
                coverFormData.append('type', 'cover');

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: coverFormData,
                });

                if (!uploadRes.ok) {
                    const errorText = await uploadRes.text();
                    console.error('Upload error:', errorText);
                    throw new Error('Failed to upload cover image.');
                }

                const { url } = await uploadRes.json();
                coverUrl = url;
            }

            // 2. Upload PDF
            let pdfUrl = ''
            if (pdfFile.size > 0) {
                const pdfFormData = new FormData();
                pdfFormData.append('file', pdfFile);
                pdfFormData.append('type', 'pdf');

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: pdfFormData,
                });

                if (!uploadRes.ok) {
                    throw new Error('Failed to upload PDF file.');
                }

                const { url } = await uploadRes.json();
                pdfUrl = url;
            }

            // 3. Save to DB (via API)
            const res = await fetch('/api/books', {
                method: 'POST',
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

            if (!res.ok) {
                const responseData = await res.json().catch(() => ({ message: 'A server error occurred.' }));
                throw new Error(responseData?.message || 'Failed to save book.');
            }

            router.push('/browse')
        } catch (error: any) {
            console.error('Book Creation Error:', error)
            alert(error.message || 'An error occurred while creating the book.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Publish <span className="text-purple-600">New Book</span>
            </h1>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl space-y-6">

                {/* Title */}
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Book Title</label>
                    <input name="title" required className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Enter book title" />
                </div>

                {/* Category */}
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Category</label>
                    <select name="category" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-purple-500 outline-none">
                        {bookCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Synopsis</label>
                    <textarea name="description" rows={4} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-purple-500 outline-none resize-none" placeholder="What is this book about?" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Cover Upload */}
                    <div className="bg-slate-50 dark:bg-black/20 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center hover:border-purple-500 transition-colors cursor-pointer relative group">
                        <ImageIcon className="mx-auto text-slate-400 mb-2 group-hover:text-purple-500 transition-colors" size={32} />
                        <span className="text-xs font-bold text-slate-500 uppercase">Upload Cover</span>
                        <input type="file" name="cover" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>

                    {/* PDF Upload */}
                    <div className="bg-slate-50 dark:bg-black/20 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center hover:border-red-500 transition-colors cursor-pointer relative group">
                        <Upload className="mx-auto text-slate-400 mb-2 group-hover:text-red-500 transition-colors" size={32} />
                        <span className="text-xs font-bold text-slate-500 uppercase">Upload PDF</span>
                        <input type="file" name="pdf" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                </div>

                <button
                    disabled={isLoading}
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-purple-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <BookOpen size={20} />}
                    Publish to Library
                </button>
            </form>
        </div>
    )
}
