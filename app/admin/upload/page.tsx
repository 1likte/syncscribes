'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Upload, Book, Image as ImageIcon, Check, AlertCircle } from 'lucide-react'

export default function UploadBookPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    // Protect route - simple check for now (In real app, check role)
    // Assuming 'chefy' is admin based on user path
    const isAdmin = true

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p className="text-slate-400">Only administrators can access this page.</p>
                    <button onClick={() => router.push('/')} className="mt-4 text-blue-400 hover:underline">Return Home</button>
                </div>
            </div>
        )
    }

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Fiction',
        language: 'English',
        price: '0'
    })

    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [bookFile, setBookFile] = useState<File | null>(null)

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            if (!coverFile || !bookFile) {
                throw new Error('Please upload both cover image and book PDF')
            }

            const data = new FormData()
            data.append('title', formData.title)
            data.append('description', formData.description)
            // data.append('author', 'Admin') // Author implied from session
            data.append('category', formData.category)
            data.append('language', formData.language)
            data.append('price', formData.price)
            data.append('tags', JSON.stringify([]))
            data.append('coverImage', coverFile)
            data.append('bookFile', bookFile)

            const res = await fetch('/api/books', {
                method: 'POST',
                body: data
            })

            if (!res.ok) {
                const errData = await res.json()
                throw new Error(errData.error || 'Failed to upload book')
            }

            setSuccess(true)
            setTimeout(() => router.push('/'), 2000)
        } catch (err: any) {
            console.error(err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8 pl-24"> {/* Left padding for sidebar */}
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Upload New Book
                    </h1>
                    <p className="text-slate-400 mt-2">Add a new PDF book to the library.</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center">
                        <AlertCircle className="w-5 h-5 mr-3" />
                        {error}
                    </div>
                )}

                {success ? (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-8 rounded-xl flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                            <Check className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Upload Successful!</h3>
                        <p>Redirecting to library...</p>
                    </div>
                ) : (
                    <form onSubmit={handleCreate} className="space-y-6 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">

                        {/* Title & Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Book Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Enter book title"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-300"
                                >
                                    <option value="Fiction">Fiction</option>
                                    <option value="Non-Fiction">Non-Fiction</option>
                                    <option value="Sci-Fi">Sci-Fi</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Business">Business</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Description</label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[120px]"
                                placeholder="Book description..."
                            />
                        </div>

                        {/* File Uploads */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Cover Image */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Cover Image</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setCoverFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                        id="cover-upload"
                                    />
                                    <label
                                        htmlFor="cover-upload"
                                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${coverFile ? 'border-green-500/50 bg-green-500/5' : 'border-slate-700 hover:border-blue-500 hover:bg-slate-800/50'}`}
                                    >
                                        <ImageIcon className={`w-8 h-8 mb-2 ${coverFile ? 'text-green-500' : 'text-slate-500'}`} />
                                        <span className="text-xs text-slate-400">
                                            {coverFile ? coverFile.name : 'Click to upload cover'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* PDF File */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Book PDF</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={e => setBookFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                        id="book-upload"
                                    />
                                    <label
                                        htmlFor="book-upload"
                                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${bookFile ? 'border-green-500/50 bg-green-500/5' : 'border-slate-700 hover:border-blue-500 hover:bg-slate-800/50'}`}
                                    >
                                        <Book className={`w-8 h-8 mb-2 ${bookFile ? 'text-green-500' : 'text-slate-500'}`} />
                                        <span className="text-xs text-slate-400">
                                            {bookFile ? bookFile.name : 'Click to upload PDF'}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center space-x-2 transition-all ${loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white'}`}
                        >
                            {loading ? (
                                <span>Uploading...</span>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    <span>Publish Book</span>
                                </>
                            )}
                        </motion.button>
                    </form>
                )}
            </div>
        </div>
    )
}
