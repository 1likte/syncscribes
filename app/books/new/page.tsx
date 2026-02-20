'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { BookOpen, Upload, X, Plus, Trash2, Globe, Bookmark, FileText, CheckCircle2 } from 'lucide-react'

interface BookFormData {
  title: string
  description: string
  price: number
  isbn: string
  pageCount: number
  language: string
  category: string
  tags: string[]
  coverImage: File | null
  bookFile: File | null
}

const languages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Turkish'
]

export default function NewBookPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([])

  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    description: '',
    price: 0,
    isbn: '',
    pageCount: 0,
    language: 'English',
    category: '',
    tags: [],
    coverImage: null,
    bookFile: null
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
    fetchCategories()
  }, [status, router])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (Array.isArray(data)) {
        setCategories(data)
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, category: data[0].id }))
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!session) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'coverImage' | 'bookFile') => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, [fileType]: file }))
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formDataToSend = new FormData()
      Object.keys(formData).forEach(key => {
        if (key === 'coverImage' || key === 'bookFile') {
          if (formData[key as keyof BookFormData]) {
            formDataToSend.append(key, formData[key as keyof BookFormData] as File)
          }
        } else if (key === 'tags') {
          formDataToSend.append(key, JSON.stringify(formData.tags))
        } else {
          formDataToSend.append(key, (formData[key as keyof BookFormData] as any).toString())
        }
      })

      const response = await fetch('/api/books', {
        method: 'POST',
        body: formDataToSend
      })

      const data = await response.json()
      if (response.ok) {
        router.push(`/books/${data.id}`)
      }
    } catch (error) {
      console.error('Book creation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen className="text-primary w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tighter uppercase italic">
            Publish Your <span className="text-primary">Masterpiece</span>
          </h1>
          <p className="text-muted-foreground font-bold tracking-widest text-[10px] uppercase">
            Share your story with a global audience of AI-powered readers
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/10 backdrop-blur-2xl rounded-[40px] border border-white/5 overflow-hidden shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="divide-y divide-white/5">
            <div className="p-10 space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-2">Book Title</label>
                  <input
                    required
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold outline-none"
                    placeholder="E.g. The Future of AI"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-2">Category</label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold outline-none"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-2">Description</label>
                <textarea
                  required
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:ring-2 focus:ring-primary/20 transition-all font-bold outline-none h-32"
                  placeholder="Capture your readers' imagination..."
                />
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-2">ISBN (Optional)</label>
                  <input
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold outline-none"
                    placeholder="978-1-23-456789-0"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-2">Page Count</label>
                  <input
                    type="number"
                    name="pageCount"
                    value={formData.pageCount}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold outline-none"
                    placeholder="350"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-2">Language</label>
                  <select
                    name="language"
                    required
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold outline-none"
                  >
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Files */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-2">Cover Image</label>
                  <label className="relative group cursor-pointer block">
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'coverImage')} className="hidden" />
                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center group-hover:bg-primary/5 group-hover:border-primary/50 transition-all">
                      <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground line-clamp-1">
                        {formData.coverImage ? formData.coverImage.name : 'Select JPG/PNG'}
                      </span>
                    </div>
                  </label>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em) text-muted-foreground px-2">Book File (PDF)</label>
                  <label className="relative group cursor-pointer block">
                    <input type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'bookFile')} className="hidden" />
                    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center group-hover:bg-primary/5 group-hover:border-primary/50 transition-all">
                      <FileText className="w-8 h-8 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground line-clamp-1">
                        {formData.bookFile ? formData.bookFile.name : 'Select PDF Document'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-2">Tags</label>
                <div className="flex gap-3">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold outline-none"
                    placeholder="E.g. futurism, biography..."
                  />
                  <Button type="button" onClick={handleAddTag} className="bg-white/10 hover:bg-primary rounded-2xl px-6">
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <AnimatePresence>
                    {formData.tags.map((tag) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20"
                      >
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2 hover:text-white transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="p-10 bg-primary/2 flex justify-end gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/')}
                className="text-[10px] font-black uppercase tracking-widest"
              >
                Discard
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary text-primary-foreground px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-[0.4em] hover:scale-105 transition-all shadow-2xl shadow-primary/20"
              >
                {isLoading ? 'Publishing...' : 'Confirm & Publish'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
