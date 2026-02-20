'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Users, Lock, Globe, MessageCircle, Crown, Search, LogOut, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface ChatRoom {
    id: string;
    name: string;
    description: string | null;
    isPublic: boolean;
    maxMembers: number;
    inviteCode: string;
    ownerId: string;
    owner: {
        username: string;
        avatar: string | null;
    };
    _count: {
        members: number;
    };
    isMember?: boolean;
}

import { Suspense } from 'react';

function ChatRoomsContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [allRooms, setAllRooms] = useState<ChatRoom[]>([]);
    const [myRooms, setMyRooms] = useState<ChatRoom[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
    const [newRoom, setNewRoom] = useState({
        name: '',
        description: '',
        isPublic: true,
        maxMembers: 100,
        color: 'emerald'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    const COLORS = [
        { name: 'emerald', bg: 'bg-emerald-500' },
        { name: 'blue', bg: 'bg-blue-500' },
        { name: 'rose', bg: 'bg-rose-500' },
        { name: 'amber', bg: 'bg-amber-500' },
        { name: 'violet', bg: 'bg-violet-500' },
        { name: 'cyan', bg: 'bg-cyan-500' },
    ];

    useEffect(() => {
        if (status === 'authenticated') {
            fetchRooms();
        }
    }, [status]);

    useEffect(() => {
        if (searchParams.get('create') === 'true') {
            setShowCreateModal(true);
        }
    }, [searchParams]);

    const fetchRooms = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/chat-rooms');
            const data = await res.json();

            // Separate my rooms from all rooms
            const my = data.filter((room: ChatRoom) => room.isMember);
            const all = data;

            setMyRooms(my);
            setAllRooms(all);
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createRoom = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newRoom.name || isSubmitting) return;

        try {
            setIsSubmitting(true);
            setCreateError(null);
            const res = await fetch('/api/chat-rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRoom)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create room');
            }

            const data = await res.json();
            setShowCreateModal(false);
            setNewRoom({ name: '', description: '', isPublic: true, maxMembers: 100, color: 'emerald' });
            router.push(`/chat-rooms/${data.slug || data.id}`);
        } catch (error: any) {
            console.error('Failed to create room:', error);
            setCreateError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const leaveRoom = async (roomId: string) => {
        if (!confirm('Are you sure you want to leave this room?')) return;

        try {
            await fetch(`/api/chat-rooms/${roomId}/leave`, {
                method: 'POST'
            });
            fetchRooms();
        } catch (error) {
            console.error('Failed to leave room:', error);
        }
    };

    const filteredRooms = (activeTab === 'my' ? myRooms : allRooms).filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (status === 'loading' || isLoading) {
        return (
            <div className="min-h-screen pt-24 pb-12 bg-transparent relative z-10 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading chat rooms...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-transparent relative z-10">
            <div className="container mx-auto px-6 max-w-7xl">
                {/* Compact Header & Search Section */}
                <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-12">
                    <div className="text-center md:text-left">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl md:text-6xl font-black text-foreground tracking-tighter italic"
                        >
                            CHAT <span className="text-primary">ROOMS</span>
                        </motion.h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 mt-2">
                            The Global Pulse // Connect
                        </p>
                    </div>

                    <div className="w-full md:max-w-md">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000" />
                            <div className="relative">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Find your sanctuary..."
                                    className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-2xl focus:outline-none focus:ring-2 focus:ring-primary text-sm font-bold shadow-xl transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create Action Row */}
                <div className="mb-10 flex justify-center md:justify-start">
                    {session && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowCreateModal(true)}
                            className="px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 border border-white/10"
                        >
                            <Plus size={16} strokeWidth={3} />
                            Create Sanctuary
                        </motion.button>
                    )}
                </div>

                {/* Tabs */}
                <div className="mb-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-bold transition-all whitespace-nowrap text-sm md:text-base ${activeTab === 'my'
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'bg-white/50 dark:bg-white/5 text-muted-foreground hover:bg-white/80 dark:hover:bg-white/10'
                            }`}
                    >
                        My Rooms ({myRooms.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-bold transition-all whitespace-nowrap text-sm md:text-base ${activeTab === 'all'
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'bg-white/50 dark:bg-white/5 text-muted-foreground hover:bg-white/80 dark:hover:bg-white/10'
                            }`}
                    >
                        All Rooms ({allRooms.length})
                    </button>
                </div>

                {/* Rooms Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredRooms.map((room) => (
                        <motion.div
                            key={room.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {room.isPublic ? (
                                        <Globe className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    ) : (
                                        <Lock className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                    )}
                                    <h3 className="font-black text-lg md:text-xl truncate">{room.name}</h3>
                                    {session?.user?.id === room.ownerId && (
                                        <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                    )}
                                </div>
                            </div>

                            <p className="text-muted-foreground text-xs md:text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                                {room.description || 'No description'}
                            </p>

                            <div className="flex items-center justify-between text-[11px] md:text-sm mb-4">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Users className="w-4 h-4" />
                                    <span>{room._count.members}/{room.maxMembers}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground truncate ml-4">
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="truncate">by {room.owner.username}</span>
                                </div>
                            </div>

                            {room._count.members >= 1000 && room.ownerId === session?.user?.id && (
                                <div className="mb-4 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 dark:text-green-400 text-[10px] font-bold text-center">
                                    🎉 FREE ACCESS UNLOCKED!
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={() => router.push(`/chat-rooms/${room.id}`)}
                                    className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all text-sm"
                                >
                                    {room.isMember ? 'Open' : 'Join'}
                                </button>
                                {room.isMember && room.ownerId !== session?.user?.id && (
                                    <button
                                        onClick={() => leaveRoom(room.id)}
                                        className="px-4 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all shrink-0"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredRooms.length === 0 && (
                    <div className="text-center py-16 md:py-20 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-200 dark:border-white/5 flex flex-col items-center gap-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users size={32} className="text-primary" />
                        </div>
                        <div className="max-w-xs mx-auto">
                            <p className="text-slate-500 dark:text-muted-foreground text-sm md:text-lg italic px-4 font-bold">
                                {searchQuery ? 'No rooms found matching your search.' : activeTab === 'my' ? 'You haven\'t joined any rooms yet.' : 'No rooms available yet.'}
                            </p>
                        </div>
                        {session && !searchQuery && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                Create Your First Room
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Create Room Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <h2 className="text-3xl font-black italic tracking-tighter">Create <span className="text-primary">Room</span></h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={createRoom} className="flex-1 flex flex-col overflow-hidden">
                            <div className="p-8 overflow-y-auto space-y-6 flex-1">
                                {createError && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold animate-shake">
                                        ⚠️ {createError}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Room Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newRoom.name}
                                        onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary font-bold"
                                        placeholder="My Awesome Room"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Description</label>
                                    <textarea
                                        value={newRoom.description}
                                        onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary font-bold"
                                        placeholder="What's this room about?"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Room Aesthetic</label>
                                    <div className="flex gap-4 p-2 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-x-auto no-scrollbar">
                                        {COLORS.map((color) => (
                                            <button
                                                type="button"
                                                key={color.name}
                                                onClick={() => setNewRoom({ ...newRoom, color: color.name })}
                                                className={`w-10 h-10 rounded-full ${color.bg} transition-all flex items-center justify-center flex-shrink-0 ${newRoom.color === color.name ? 'ring-4 ring-primary ring-offset-4 dark:ring-offset-zinc-950 scale-90' : 'hover:scale-110'
                                                    }`}
                                            >
                                                {newRoom.color === color.name && <Crown size={14} className="text-white" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Capacity Limit</label>
                                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10">
                                        <Users className="text-muted-foreground" size={20} />
                                        <input
                                            type="number"
                                            value={newRoom.maxMembers}
                                            onChange={(e) => setNewRoom({ ...newRoom, maxMembers: parseInt(e.target.value) })}
                                            className="bg-transparent border-none focus:outline-none font-bold text-lg w-full"
                                            min="2"
                                            max="10000"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setNewRoom({ ...newRoom, isPublic: !newRoom.isPublic })}
                                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${newRoom.isPublic ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-muted-foreground'}`}
                                >
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${newRoom.isPublic ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-white/10 text-transparent'}`}>
                                        <Globe size={14} />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-black uppercase tracking-widest">Public Access</div>
                                        <div className="text-[10px] opacity-60">Anyone can find and join this sanctuary.</div>
                                    </div>
                                </button>
                            </div>

                            <div className="p-8 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-6 py-4 rounded-2xl border border-slate-200 dark:border-white/10 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newRoom.name || isSubmitting}
                                    className="flex-1 px-6 py-4 rounded-2xl bg-primary text-white font-black hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Initializing...
                                        </>
                                    ) : (
                                        'Create Sanctuary'
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

export default function ChatRoomsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen pt-24 pb-12 bg-transparent relative z-10 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Initializing...</p>
                </div>
            </div>
        }>
            <ChatRoomsContent />
        </Suspense>
    );
}
