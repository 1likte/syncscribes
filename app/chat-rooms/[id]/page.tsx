'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Users, Copy, Share2, Crown, ArrowLeft, LogOut,
    Search, X, Smile, Paperclip, Plus, UserPlus, Trash2, Lock,
    Sun, Moon, MoreVertical, Link as LinkIcon, CheckCircle
} from 'lucide-react';
import Image from 'next/image';
import MouseWaveBackground from '@/components/MouseWaveBackground';
import Sidebar from '@/components/social/Sidebar';

// --- Interfaces ---

interface ChatRoomMember {
    userId: string;
    role: string;
    user: {
        username: string;
        avatar: string | null;
        isVerified?: boolean;
    };
}

interface ChatRoom {
    id: string;
    name: string;
    slug: string | null;
    description: string | null;
    isPublic: boolean;
    maxMembers: number;
    inviteCode: string;
    color: string;
    ownerId: string;
    owner: {
        username: string;
        avatar: string | null;
    };
    _count: {
        members: number;
    };
    members: ChatRoomMember[];
}

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    type?: 'USER' | 'SYSTEM';
    sender?: {
        username: string;
        avatar: string | null;
    };
}

// --- Constants ---

const THEMES: Record<string, { primary: string, secondary: string, accent: string, text: string }> = {
    emerald: { primary: '#10b981', secondary: 'rgba(16, 185, 129, 0.2)', accent: '#059669', text: '#ecfdf5' },
    blue: { primary: '#3b82f6', secondary: 'rgba(59, 130, 246, 0.2)', accent: '#2563eb', text: '#eff6ff' },
    rose: { primary: '#f43f5e', secondary: 'rgba(244, 63, 94, 0.2)', accent: '#e11d48', text: '#fff1f2' },
    amber: { primary: '#f59e0b', secondary: 'rgba(245, 158, 11, 0.2)', accent: '#d97706', text: '#fffbeb' },
    violet: { primary: '#8b5cf6', secondary: 'rgba(139, 92, 246, 0.2)', accent: '#7c3aed', text: '#f5f3ff' },
    cyan: { primary: '#06b6d4', secondary: 'rgba(6, 182, 212, 0.2)', accent: '#0891b2', text: '#ecfeff' },
};

const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};

const EMOJIS = ["😀", "😂", "🥰", "😎", "🤔", "👍", "❤️", "🔥", "🎉", "🚀", "👀", "🙌", "💯", "✨", "👋", "🙏", "💪", "😭", "😤", "👻"];
const SKELETON_MESSAGES = Array(20).fill(null).map((_, i) => ({
    id: `skeleton-${i}`, content: "This is a hidden message content.", sender: { username: "User", avatar: null }, createdAt: new Date().toISOString(), type: 'USER'
}));

// --- Main Page Component ---

export default function ChatRoomPage({ params }: { params: { id: string } }) {
    const { data: session } = useSession();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // State
    const [room, setRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showUserList, setShowUserList] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [memberSearch, setMemberSearch] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        fetchRoom();
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [params.id]);

    useEffect(() => {
        if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isConnecting]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchRoom = async () => {
        try {
            const res = await fetch(`/api/chat-rooms/${params.id}`);
            const data = await res.json();
            if (!res.ok) {
                console.error('Room fetch failed:', data.error);
                setRoom(null);
                return;
            }
            setRoom(data);
        } catch (error) {
            console.error('Failed to fetch room:', error);
            setRoom(null);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/chat-rooms/${params.id}/messages`);
            const data = await res.json();
            if (res.ok) {
                setMessages(data);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        try {
            const res = await fetch(`/api/chat-rooms/${params.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage })
            });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || 'Failed to send message');
                return;
            }
            setNewMessage('');
            setShowEmojiPicker(false);
            fetchMessages();
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message');
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm('Delete this message?')) return;
        try {
            const res = await fetch(`/api/chat-rooms/${params.id}/messages/${messageId}`, { method: 'DELETE' });
            if (res.ok) fetchMessages();
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    };

    const joinRoom = async () => {
        setIsConnecting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            await fetch(`/api/chat-rooms/${params.id}/join`, { method: 'POST' });
            await fetchRoom();
        } catch (error) {
            console.error('Failed to join room:', error);
        } finally {
            setIsConnecting(false);
            window.location.reload();
        }
    };

    const handleDeleteRoom = async () => {
        if (!confirm('Area you sure you want to delete this room permanently?')) return;
        try {
            const res = await fetch(`/api/chat-rooms/${params.id}`, { method: 'DELETE' });
            if (res.ok) router.push('/chat-rooms');
        } catch (error) {
            console.error('Failed to delete room:', error);
        }
    };

    const leaveRoom = async () => {
        if (!confirm('Leave room?')) return;
        try {
            await fetch(`/api/chat-rooms/${params.id}/leave`, { method: 'POST' });
            router.push('/chat-rooms');
        } catch (error) {
            console.error('Failed to leave room:', error);
        }
    };

    const handleFeatureComingSoon = () => alert("Coming soon! 🚀");
    const handleAddFriend = (username: string) => alert(`Friend request sent to ${username} ✅`);
    const addEmoji = (emoji: string) => setNewMessage(prev => prev + emoji);

    // Copy Invite Link
    const handleCopyInvite = (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${window.location.origin}/chat-rooms/${room?.slug || room?.id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const renderMessageContent = (content: string) => {
        if (!content) return null;
        // Find @username and make it clickable
        const parts = content.split(/(@\w+)/g);
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                const username = part.slice(1);
                return (
                    <span
                        key={i}
                        className="font-bold cursor-pointer hover:underline mx-0.5 px-1 rounded bg-black/5 dark:bg-white/5 transition-all"
                        style={{ color: THEMES[room?.color || 'emerald'].primary }}
                        onClick={() => router.push(`/profile/${username}`)}
                    >
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    if (!mounted) return <div className="h-screen bg-[#1a1a1a]" />;
    if (isLoading) return <div className="h-screen flex items-center justify-center bg-[#1a1a1a] text-white">Loading...</div>;
    if (!room) return <div className="h-screen flex items-center justify-center bg-[#1a1a1a] text-white">Room not found</div>;

    const isDarkMode = theme === 'dark' || theme === 'system';
    const themeObj = THEMES[room.color] || THEMES.emerald;

    const isMember = room.members?.some(m => m.user.username === session?.user?.username) || room.ownerId === session?.user?.id;
    const isOwner = room.ownerId === session?.user?.id;
    const displayMessages = isMember ? messages : SKELETON_MESSAGES;

    const pageBg = isDarkMode ? '#050505' : '#f8fafc';
    const textColor = isDarkMode ? '#e5e7eb' : '#000000';

    const inputBg = isDarkMode ? 'rgba(30, 30, 30, 0.6)' : 'rgba(255, 255, 255, 0.8)';

    return (
        <div
            className="fixed inset-0 z-[9999] flex font-sans font-medium transition-colors duration-500 overflow-hidden"
            style={{ backgroundColor: pageBg, color: textColor }}
        >
            {/* Global Sidebar */}
            <div className="absolute inset-0 pointer-events-none z-[10000]">
                <div className="pointer-events-auto">
                    <Sidebar isOpen={isMainSidebarOpen} setIsOpen={setIsMainSidebarOpen} />
                </div>
            </div>

            {/* Particles Effect */}
            <div className={`absolute inset-0 z-0 pointer-events-none opacity-100`}>
                <MouseWaveBackground />
            </div>

            {/* Main Layout */}
            <div className="flex flex-col flex-1 relative z-10 h-full bg-transparent transition-all duration-300">

                {/* Header */}
                <header
                    className="h-20 flex items-center justify-between px-4 md:px-6 shrink-0 z-20 transition-all backdrop-blur-none"
                    style={{
                        backgroundColor: 'transparent',
                        borderBottom: 'none',
                        boxShadow: 'none'
                    }}
                >
                    <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                        <button onClick={() => router.push('/chat-rooms')} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"><ArrowLeft size={20} /></button>
                        <div className="min-w-0 flex flex-col justify-center">
                            <h1 className="text-base md:text-lg font-bold flex items-center gap-2 truncate">
                                <span className="font-mono text-xl" style={{ color: themeObj.primary, textShadow: `0 0 10px ${themeObj.primary}40` }}>#</span>
                                <span className="truncate tracking-wide">{room.name}</span>
                            </h1>
                            <p className="text-[10px] md:text-xs opacity-60 truncate font-mono tracking-wider font-bold">{room.isPublic ? 'PUBLIC' : 'PRIVATE'} • {room._count?.members || 0} ONLINE</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {/* Theme Toggle */}
                        <button onClick={() => setTheme(isDarkMode ? 'light' : 'dark')} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
                            {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
                        </button>

                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold transition-all border backdrop-blur-sm"
                            style={{ backgroundColor: themeObj.secondary, color: themeObj.primary, borderColor: `${themeObj.primary}40`, boxShadow: `0 0 10px ${themeObj.secondary}` }}
                        >
                            <Share2 size={16} /><span className="hidden md:inline">Invite</span>
                        </button>

                        {(isOwner || isMember) && <button onClick={isOwner ? handleDeleteRoom : leaveRoom} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg opacity-60 hover:opacity-100">{isOwner ? <Trash2 size={20} /> : <LogOut size={20} />}</button>}

                        <button onClick={() => setShowUserList(!showUserList)} className="md:hidden p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg relative">
                            <Users size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full border border-white" style={{ backgroundColor: themeObj.primary }} />
                        </button>

                        <motion.button
                            onClick={() => setIsMainSidebarOpen(!isMainSidebarOpen)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            animate={{
                                rotate: isMainSidebarOpen ? 45 : 0,
                                backgroundColor: isMainSidebarOpen ? themeObj.primary : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                                color: isMainSidebarOpen ? '#ffffff' : themeObj.primary
                            }}
                            className="flex items-center justify-center rounded-xl transition-all shadow-lg w-10 h-10 backdrop-blur-md relative z-50 ml-2"
                            style={{
                                border: isMainSidebarOpen ? 'none' : `1px solid ${themeObj.primary}40`
                            }}
                            title="Menu / Create Post"
                        >
                            <Plus size={24} strokeWidth={3} />
                        </motion.button>
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden relative">
                    <div className="flex-1 flex flex-col relative w-full h-full">
                        {!isMember && (
                            <div className="absolute inset-0 z-20 backdrop-blur-md flex flex-col items-center justify-center p-8 transition-all" style={{ backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }}>
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl shadow-2xl backdrop-blur-xl border" style={{ backgroundColor: isDarkMode ? 'rgba(15,15,15,0.85)' : 'rgba(255,255,255,0.95)', borderColor: themeObj.primary, boxShadow: `0 0 30px ${themeObj.primary}40`, color: textColor }}>
                                    <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center border shadow-lg" style={{ backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.6)', borderColor: themeObj.primary, boxShadow: `0 0 30px ${themeObj.primary}` }}>
                                        <Lock size={32} style={{ color: themeObj.primary }} />
                                    </div>
                                    <div className="space-y-2"><h2 className="text-2xl font-bold">Join #{room.name}</h2><p className="opacity-60 text-sm">Join {room._count?.members || 0} others to participate.</p></div>
                                    <button onClick={joinRoom} disabled={isConnecting} className="w-full py-4 text-white rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3 hover:scale-[1.02]" style={{ backgroundColor: themeObj.primary, boxShadow: `0 0 20px ${themeObj.primary}60` }}>{isConnecting ? 'Connecting...' : 'JOIN CHANNEL'}</button>
                                </motion.div>
                            </div>
                        )}

                        <div className={`flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar relative ${!isMember ? 'opacity-20 pointer-events-none overflow-hidden select-none' : ''}`} ref={chatContainerRef}>
                            {displayMessages.map((msg: any, idx) => {
                                const isSequence = idx > 0 && msg.senderId === (displayMessages[idx - 1] as any)?.senderId;
                                const isMe = msg.senderId === session?.user?.id;
                                return (
                                    <div key={msg.id} className={`group relative pl-4 pr-12 py-1 transition-colors rounded ${isSequence ? 'mt-0' : 'mt-2'} hover:bg-black/5 dark:hover:bg-white/5`}>
                                        <div className="flex items-baseline gap-3">
                                            {!isSequence && <span className="text-[10px] font-mono opacity-40 w-8 shrink-0 select-none">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                            {isSequence && <div className="w-8 shrink-0" />}
                                            <div className="flex-1 min-w-0 flex items-start justify-between group-hover:pr-2">
                                                <div>
                                                    {!isSequence && <span className="font-bold text-sm mr-2 cursor-pointer hover:underline shadow-sm" style={{ color: stringToColor(msg.sender?.username || 'User'), textShadow: isDarkMode ? `0 0 10px ${stringToColor(msg.sender?.username || 'User')}40` : 'none' }}>{msg.sender?.username || 'User'}:</span>}
                                                    <span className="text-sm opacity-90">{renderMessageContent(msg.content)}</span>
                                                </div>
                                                {isMember && isMe && <button onClick={() => handleDeleteMessage(msg.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 hover:text-red-500 rounded transition-all"><Trash2 size={12} /></button>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {isMember && (
                            <div className="p-4 relative z-20 transition-colors duration-500" style={{ backgroundColor: 'transparent', borderTop: 'none', boxShadow: 'none' }}>
                                <div className="flex items-end gap-3 max-w-5xl mx-auto p-2 rounded-xl border focus-within:border-opacity-100 transition-colors shadow-lg relative" style={{ backgroundColor: inputBg, borderColor: `${themeObj.primary}40`, boxShadow: isDarkMode ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                                    <button onClick={handleFeatureComingSoon} className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg text-white hover:scale-105 active:scale-95 transition-all shadow-md backdrop-blur-sm" style={{ backgroundColor: themeObj.primary, boxShadow: `0 0 15px ${themeObj.primary}60` }} title="Add Attachment"><Plus size={24} /></button>
                                    <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder={`Message #${room.name}`} className="flex-1 bg-transparent border-none focus:ring-0 placeholder-gray-500 font-medium min-h-[44px] max-h-32 py-2.5 resize-none text-sm" style={{ color: textColor }} rows={1} />
                                    <div className="relative">
                                        <AnimatePresence>
                                            {showEmojiPicker && (
                                                <motion.div ref={emojiPickerRef} initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} className="absolute bottom-12 right-0 border rounded-2xl shadow-2xl p-3 grid grid-cols-6 gap-2 w-72 z-50 max-h-60 overflow-y-auto custom-scrollbar backdrop-blur-xl" style={{ backgroundColor: isDarkMode ? 'rgba(20,20,20,0.95)' : 'rgba(255,255,255,0.95)', borderColor: themeObj.primary, boxShadow: `0 0 20px ${themeObj.primary}40` }}>
                                                    {EMOJIS.map((emoji) => <button key={emoji} onClick={() => addEmoji(emoji)} className="text-2xl hover:bg-white/10 p-2 rounded-lg transition-colors">{emoji}</button>)}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 opacity-50 hover:opacity-100 hover:text-yellow-400 transition-colors"><Smile size={20} /></button>
                                    </div>
                                    <button onClick={sendMessage} disabled={!newMessage.trim()} className="p-2 text-white rounded-lg transition-all disabled:opacity-50 hover:opacity-90 shadow-lg" style={{ backgroundColor: themeObj.primary, boxShadow: `0 0 10px ${themeObj.primary}80` }}><Send size={18} /></button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={`fixed md:relative inset-y-0 right-0 w-64 md:w-64 transition-transform duration-300 z-30 ${showUserList ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`} style={{ backgroundColor: 'transparent', borderLeft: 'none', boxShadow: 'none' }}>
                        <div className="h-full flex flex-col">
                            <div className="p-4 border-b shrink-0" style={{ borderColor: `${themeObj.primary}30` }}>
                                <h3 className="text-xs font-bold opacity-50 uppercase tracking-widest mb-3" style={{ color: themeObj.primary }}>Online — {room._count?.members || 0}</h3>
                                <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" style={{ color: textColor }} /><input type="text" value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} placeholder="Find user..." className="w-full border-none rounded-lg py-2 pl-9 pr-3 text-xs focus:ring-1 bg-transparent" style={{ outlineColor: themeObj.primary, color: textColor, backgroundColor: inputBg }} /></div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {(room.members || []).filter(m => m.user.username.toLowerCase().includes(memberSearch.toLowerCase())).map(member => {
                                    const isSelf = member.user.username === session?.user?.username;
                                    return (
                                        <div key={member.userId} className="flex items-center gap-3 p-2 rounded-lg transition-all duration-300 cursor-default group border border-transparent hover:bg-black/5 dark:hover:bg-white/5" onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 15px ${themeObj.primary}40`; e.currentTarget.style.borderColor = `${themeObj.primary}60`; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'transparent'; }}>
                                            <div className="relative">
                                                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-bold text-xs" style={{ backgroundColor: isDarkMode ? 'rgba(50,50,50,0.5)' : 'rgba(200,200,200,0.5)', color: textColor }}>{member.user.avatar ? <Image src={member.user.avatar} alt={member.user.username} width={32} height={32} /> : member.user.username[0].toUpperCase()}</div>
                                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 rounded-full" style={{ backgroundColor: themeObj.primary, borderColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.6)' }}></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 min-w-0"><span className="font-medium text-sm truncate" style={{ color: member.role === 'OWNER' ? themeObj.accent : textColor }}>{member.user.username}</span>{member.role === 'OWNER' && <Crown size={12} style={{ color: themeObj.accent }} />}</div>
                                                    {!isSelf && <button onClick={(e) => { e.stopPropagation(); handleAddFriend(member.user.username); }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/10 rounded transition-all hover:scale-110" style={{ color: themeObj.primary }} title="Add Friend"><UserPlus size={14} /></button>}
                                                </div>
                                                <div className="text-[10px] opacity-50 truncate">{member.role === 'OWNER' ? 'Room Owner' : 'Member'}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button onClick={() => setShowUserList(false)} className="md:hidden absolute top-4 right-4 opacity-50 hover:opacity-100"><X size={20} /></button>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showInviteModal && (
                    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowInviteModal(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm p-8 rounded-3xl shadow-2xl border backdrop-blur-2xl overflow-hidden" style={{ backgroundColor: isDarkMode ? 'rgba(20,20,20,0.92)' : 'rgba(255,255,255,0.95)', borderColor: `${themeObj.primary}80`, boxShadow: `0 0 40px ${themeObj.primary}30` }}>
                            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-[80px] opacity-20 pointer-events-none" style={{ backgroundColor: themeObj.primary }} />
                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-3"><Share2 size={28} style={{ color: themeObj.primary }} />Say Hello!</h3>
                                    <p className="text-xs font-bold opacity-40 uppercase tracking-widest px-1">Invite your squad</p>
                                </div>
                                <button type="button" onClick={(e) => { e.stopPropagation(); setShowInviteModal(false); }} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all hover:rotate-90 cursor-pointer relative z-20"><X size={24} /></button>
                            </div>
                            <div className="space-y-6 relative z-10">
                                <div className="p-1 rounded-2xl border transition-all duration-300" style={{ borderColor: `${themeObj.primary}20`, backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }}>
                                    <div className="flex items-center gap-3 p-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: themeObj.secondary }}><LinkIcon size={20} style={{ color: themeObj.primary }} /></div>
                                        <div className="flex-1 min-w-0 pr-2">
                                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-tighter mb-0.5">ROOM LINK</p>
                                            <input type="text" readOnly value={typeof window !== 'undefined' ? `${window.location.origin}/chat-rooms/${room?.slug || room?.id}` : ''} className="w-full bg-transparent border-none text-sm font-mono focus:ring-0 p-0 text-ellipsis opacity-80" style={{ color: textColor }} />
                                        </div>
                                    </div>
                                </div>
                                <button type="button" onClick={(e) => handleCopyInvite(e)} className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 group overflow-hidden relative" style={{ backgroundColor: copied ? '#10b981' : themeObj.primary, color: '#ffffff', boxShadow: `0 8px 25px ${copied ? '#10b981' : themeObj.primary}40` }}>{copied ? <CheckCircle size={20} className="animate-bounce" /> : <Copy size={20} className="group-hover:scale-110 transition-transform" />}<span>{copied ? 'Link Copied!' : 'Copy Invite Link'}</span></button>
                                <p className="text-[10px] text-center opacity-40 font-bold uppercase tracking-widest">Link never expires • {room._count?.members || 0} online</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
