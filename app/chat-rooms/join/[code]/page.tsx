'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Users, ArrowRight, Loader2 } from 'lucide-react';

export default function JoinRoomPage({ params }: { params: { code: string } }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [room, setRoom] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRoomByCode();
    }, [params.code]);

    const fetchRoomByCode = async () => {
        try {
            const res = await fetch(`/api/chat-rooms/join/${params.code}`);
            if (res.ok) {
                const data = await res.json();
                setRoom(data);
            } else {
                setError('Invalid invite code');
            }
        } catch (error) {
            setError('Failed to load invite');
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoin = async () => {
        if (status === 'unauthenticated') {
            router.push(`/auth/signin?callbackUrl=/chat-rooms/join/${params.code}`);
            return;
        }

        try {
            const res = await fetch(`/api/chat-rooms/${room.id}/join`, {
                method: 'POST'
            });

            if (res.ok) {
                router.push(`/chat-rooms/${room.id}`);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to join room');
            }
        } catch (error) {
            alert('Failed to join room');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 pb-12 bg-transparent relative z-10 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading invite...</p>
                </div>
            </div>
        );
    }

    if (error || !room) {
        return (
            <div className="min-h-screen pt-24 pb-12 bg-transparent relative z-10 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-2xl font-bold text-foreground mb-4">Invalid Invite</p>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/chat-rooms')}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all"
                    >
                        Browse Rooms
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-transparent relative z-10">
            <div className="container mx-auto px-6">
                <div className="max-w-md mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-2xl text-center"
                    >
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Users className="w-10 h-10 text-primary" />
                        </div>

                        <h1 className="text-3xl font-black text-foreground mb-2">You're Invited!</h1>
                        <p className="text-muted-foreground mb-8">
                            Join <span className="font-bold text-foreground">{room.name}</span>
                        </p>

                        {room.description && (
                            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <p className="text-sm text-muted-foreground italic">"{room.description}"</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            <div className="text-left">
                                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Members</p>
                                <p className="text-2xl font-black text-foreground">{room._count.members}/{room.maxMembers}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Owner</p>
                                <p className="text-sm font-bold text-foreground">@{room.owner.username}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleJoin}
                            disabled={room._count.members >= room.maxMembers}
                            className="w-full px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {status === 'unauthenticated' ? 'Sign In to Join' : 'Join Room'}
                            <ArrowRight className="w-4 h-4" />
                        </button>

                        {room._count.members >= room.maxMembers && (
                            <p className="text-sm text-red-500 mt-4 font-bold">This room is full</p>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
