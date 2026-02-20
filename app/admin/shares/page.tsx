'use client';

import { useState, useEffect } from 'react';
import {
    FileText,
    Image,
    Video,
    Link2,
    Plus,
    Trash2,
    Edit2,
    Eye,
    EyeOff,
    Loader2,
    X,
} from 'lucide-react';

interface SharePost {
    id: string;
    type: string;
    title?: string | null;
    content: string;
    imageUrl?: string | null;
    videoUrl?: string | null;
    linkUrl?: string | null;
    isHidden: boolean;
    order: number;
    createdAt: string;
}

const TYPES = [
    { value: 'TEXT', label: 'Text', icon: FileText },
    { value: 'IMAGE', label: 'Image', icon: Image },
    { value: 'VIDEO', label: 'Video Link', icon: Video },
    { value: 'LINK', label: 'Link', icon: Link2 },
];

export default function AdminSharesPage() {
    const [posts, setPosts] = useState<SharePost[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({
        type: 'TEXT',
        title: '',
        content: '',
        imageUrl: '',
        videoUrl: '',
        linkUrl: '',
        isHidden: false,
    });
    const [submitting, setSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/shares?admin=true');
            const data = await res.json();
            setPosts(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const resetForm = () => {
        setForm({
            type: 'TEXT',
            title: '',
            content: '',
            imageUrl: '',
            videoUrl: '',
            linkUrl: '',
            isHidden: false,
        });
        setEditingId(null);
        setImageFile(null);
        setShowModal(false);
    };

    const handleEdit = (post: SharePost) => {
        setForm({
            type: post.type,
            title: post.title || '',
            content: post.content,
            imageUrl: post.imageUrl || '',
            videoUrl: post.videoUrl || '',
            linkUrl: post.linkUrl || '',
            isHidden: post.isHidden,
        });
        setEditingId(post.id);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            let imageUrl = form.imageUrl;
            if (imageFile && form.type === 'IMAGE') {
                const fd = new FormData();
                fd.append('file', imageFile);
                fd.append('type', 'cover');
                const up = await fetch('/api/upload', { method: 'POST', body: fd });
                if (!up.ok) throw new Error('Image upload failed');
                const { url } = await up.json();
                imageUrl = url;
            }

            const payload = {
                type: form.type,
                title: form.title || null,
                content: form.content,
                imageUrl: form.type === 'IMAGE' ? imageUrl : null,
                videoUrl: form.type === 'VIDEO' ? form.videoUrl : null,
                linkUrl: form.type === 'LINK' ? form.linkUrl : null,
                isHidden: form.isHidden,
            };

            if (editingId) {
                const res = await fetch(`/api/shares/${editingId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error((await res.json()).message || 'Update failed');
            } else {
                const res = await fetch('/api/shares', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error((await res.json()).message || 'Create failed');
            }

            resetForm();
            fetchPosts();
            } catch (err: any) {
            alert(err.message || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            const res = await fetch(`/api/shares/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setPosts(posts.filter((p) => p.id !== id));
            } else {
                alert('Delete failed');
            }
        } catch (e) {
            alert('Something went wrong');
        }
    };

    const handleToggleHidden = async (post: SharePost) => {
        try {
            const res = await fetch(`/api/shares/${post.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isHidden: !post.isHidden }),
            });
            if (res.ok) {
                setPosts(
                    posts.map((p) =>
                        p.id === post.id ? { ...p, isHidden: !p.isHidden } : p
                    )
                );
            }
        } catch (e) {
            alert('Update failed');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-purple-600" size={40} />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                    Loading...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Sharing <span className="text-purple-600">Hub</span>
                </h1>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-600/20 transition-all active:scale-95"
                >
                    <Plus size={16} />
                    New Post
                </button>
            </div>

            <p className="text-slate-500 dark:text-white/50 text-sm">
                Content you add here appears on the <strong>/blog</strong> page (pen icon).
                You can share video links, long text (up to 2000 words), links or images.
            </p>

            {posts.length === 0 ? (
                <div className="bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 p-20 text-center">
                    <FileText size={48} className="mx-auto text-slate-300 dark:text-white/10 mb-4" />
                    <p className="text-slate-500 dark:text-white/40 font-bold">Henüz paylaşım yok.</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="mt-4 text-purple-600 font-bold hover:underline"
                    >
                        Add first post
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => {
                        const TypeIcon = TYPES.find((t) => t.value === post.type)?.icon || FileText;
                        return (
                            <div
                                key={post.id}
                                className={`flex items-center justify-between p-6 rounded-2xl border transition-all ${
                                    post.isHidden
                                        ? 'bg-slate-50/50 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/5 opacity-70'
                                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10'
                                }`}
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                        <TypeIcon size={24} className="text-purple-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-slate-900 dark:text-white truncate">
                                            {post.title || post.content.slice(0, 50) + '...'}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-white/40">
                                            {post.type} • {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                                            {post.isHidden && ' • Hidden'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleHidden(post)}
                                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-amber-500 transition-colors"
                                        title={post.isHidden ? 'Göster' : 'Gizle'}
                                    >
                                        {post.isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(post)}
                                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-blue-500 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">
                                {editingId ? 'Edit Post' : 'New Post'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                                    Content Type
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {TYPES.map((t) => (
                                        <button
                                            key={t.value}
                                            type="button"
                                            onClick={() => setForm({ ...form, type: t.value })}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                                form.type === t.value
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'
                                            }`}
                                        >
                                            <t.icon size={16} />
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                                    Title (optional)
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent"
                                    placeholder="e.g. Great article"
                                />
                            </div>

                            {form.type === 'IMAGE' && (
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                                        Image
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                        className="w-full text-sm"
                                    />
                                    {form.imageUrl && !imageFile && (
                                        <img src={form.imageUrl} alt="" className="mt-2 w-32 h-32 object-cover rounded-xl" />
                                    )}
                                </div>
                            )}

                            {form.type === 'VIDEO' && (
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                                        Video URL (YouTube, etc.)
                                    </label>
                                    <input
                                        type="url"
                                        value={form.videoUrl}
                                        onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                </div>
                            )}

                            {form.type === 'LINK' && (
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                                        Link URL
                                    </label>
                                    <input
                                        type="url"
                                        value={form.linkUrl}
                                        onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent"
                                        placeholder="https://..."
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                                    Content *
                                </label>
                                <textarea
                                    value={form.content}
                                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent min-h-[120px]"
                                    placeholder="Text, description (up to ~2000 words)"
                                    maxLength={12000}
                                />
                                <p className="text-xs text-slate-400 mt-1">
                                    {form.content.length} / 12000 characters
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isHidden"
                                    checked={form.isHidden}
                                    onChange={(e) => setForm({ ...form, isHidden: e.target.checked })}
                                    className="rounded"
                                />
                                <label htmlFor="isHidden" className="text-sm font-bold text-slate-600 dark:text-white/70">
                                    Hidden (only visible to admin)
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting || !form.content.trim()}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-bold"
                                >
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                                    {editingId ? 'Update' : 'Publish'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-3 rounded-xl border border-slate-200 dark:border-white/10 font-bold hover:bg-slate-100 dark:hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
