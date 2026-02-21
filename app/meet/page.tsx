'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Logo from '@/components/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic,
    MicOff,
    Video as VideoIcon,
    VideoOff,
    PhoneOff,
    Sparkles,
    MapPin,
    X,
    Camera,
    Info,
    Volume2,
    Settings,
    MoreVertical,
    MessageSquare,
    UserPlus,
    Heart,
    ChevronUp,
    ChevronDown,
    User,
    RefreshCcw
} from 'lucide-react';
import { usePaywall } from '@/hooks/usePaywall';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

// Particle Component for Background
const ParticleEffect = ({ count = 12 }: { count?: number }) => {
    const particles = useMemo(() =>
        Array.from({ length: count }).map((_, i) => ({
            id: i,
            size: Math.random() * 5 + 3,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            duration: Math.random() * 15 + 15,
            delay: Math.random() * 7
        })), [count]
    );

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: [0.1, 0.3, 0.1],
                        scale: [1, 1.5, 1],
                        x: [0, Math.random() * 100 - 50, 0],
                        y: [0, Math.random() * 100 - 50, 0]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeInOut"
                    }}
                    className="absolute bg-primary/40 rounded-full blur-[3px]"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: p.left,
                        top: p.top,
                    }}
                />
            ))}
        </div>
    );
};

interface DiscoveryPerson {
    id: string;
    name: string;
    age: number;
    location: string;
    bio: string;
    initials: string;
    interests?: string[];
}

const mockPeople: DiscoveryPerson[] = [
    { id: '1', name: 'Sarah Connor', age: 24, location: 'New York, USA', bio: 'Book lover, coffee addict ☕ 📚', initials: 'SC', interests: ['Sci-Fi', 'Coffee', 'Robotics'] },
    { id: '2', name: 'Alex Rivera', age: 27, location: 'Madrid, Spain', bio: 'Digital nomad & story weaver.', initials: 'AR', interests: ['Travel', 'Short Stories'] },
    { id: '3', name: 'Yuki Tanaka', age: 22, location: 'Tokyo, Japan', bio: 'Manga artist and light novel reader. 🎨', initials: 'YT', interests: ['Art', 'Anime'] }
];

export default function MeetPage() {
    const { data: session, status } = useSession();
    const { triggerPaywall, isSubscribed } = usePaywall();
    const { theme, setTheme } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const [isVideoOff, setIsVideoOff] = useState(true);
    const [isJoined, setIsJoined] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [friendRequested, setFriendRequested] = useState<Record<string, boolean>>({});

    const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string>('');
    const [showCameraMenu, setShowCameraMenu] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const isBanned = useMemo(() => {
        if (!session?.user?.bannedUntil) return false;
        return new Date(session.user.bannedUntil) > new Date();
    }, [session?.user?.bannedUntil]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        if (status !== 'loading' && !isSubscribed) triggerPaywall(5);
        return () => window.removeEventListener('resize', checkMobile);
    }, [status, isSubscribed]);

    const nextPerson = () => {
        if (isScrolling) return;
        setIsScrolling(true);
        setCurrentIndex((prev) => (prev + 1) % mockPeople.length);
        setIsLiked(false);
        setTimeout(() => setIsScrolling(false), 800);
    };

    const prevPerson = () => {
        if (isScrolling) return;
        setIsScrolling(true);
        setCurrentIndex((prev) => (prev - 1 + mockPeople.length) % mockPeople.length);
        setIsLiked(false);
        setTimeout(() => setIsScrolling(false), 800);
    };

    // Scroll Wheel Handling
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (isScrolling) return;
            if (Math.abs(e.deltaY) > 30) {
                if (e.deltaY > 0) nextPerson();
                else prevPerson();
            }
        };
        window.addEventListener('wheel', handleWheel, { passive: true });
        return () => window.removeEventListener('wheel', handleWheel);
    }, [isScrolling]);

    // Unified device and stream handling
    useEffect(() => {
        let currentStream: MediaStream | null = null;

        const setupCamera = async () => {
            if (isVideoOff) {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }
                return;
            }

            try {
                // Stop existing tracks before starting new ones
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }

                const constraints = {
                    video: selectedCameraId ? { deviceId: { exact: selectedCameraId } } : true,
                    audio: !isMuted
                };

                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                currentStream = stream;
                streamRef.current = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;

                // After successful stream, refresh device list to get labels
                const devices = await navigator.mediaDevices.enumerateDevices();
                const cameras = devices.filter(device => device.kind === 'videoinput');
                setAvailableCameras(cameras);

                if (cameras.length > 0 && !selectedCameraId) {
                    setSelectedCameraId(cameras[0].deviceId);
                }
            } catch (err) {
                console.error("Camera access error:", err);
                // Fallback
                if (selectedCameraId) {
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: !isMuted });
                        streamRef.current = stream;
                        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
                    } catch (e) { console.error("Total camera failure"); }
                }
            }
        };

        setupCamera();

        return () => {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isVideoOff, isMuted, selectedCameraId]);

    const person = mockPeople[currentIndex];

    // --- LANDING / PRE-JOIN SCREEN ---
    if (!isJoined) {
        return (
            <div className="fixed inset-0 bg-background dark:bg-[#0c0c0e] flex flex-col items-center justify-start md:justify-center p-6 pt-6 md:pt-6 z-[200]">
                <header className="fixed top-0 left-0 right-0 z-[210] flex items-center justify-between px-6 h-16 bg-transparent">
                    <Logo size="sm" />
                </header>
                <ParticleEffect count={20} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="w-full max-w-lg relative"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-600 to-pink-500 rounded-[3rem] blur-2xl opacity-20 animate-pulse" />
                    <div className="relative bg-white/90 dark:bg-zinc-900/90 backdrop-blur-3xl p-10 md:p-14 rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-2xl text-center space-y-8">
                        <motion.div
                            initial={{ rotate: -10, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ type: "spring", damping: 10 }}
                            className="w-24 h-24 bg-primary/10 rounded-3xl mx-auto flex items-center justify-center text-primary mb-2"
                        >
                            <VideoIcon size={48} strokeWidth={2.5} />
                        </motion.div>

                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-tight">
                                Ready to <span className="text-primary italic">Sync?</span>
                            </h1>
                            <p className="text-slate-500 dark:text-white/40 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs">
                                End-to-End Encrypted Video Discovery
                            </p>
                        </div>

                        <div className="space-y-4 pt-4">
                            <button
                                onClick={() => {
                                    setIsJoined(true);
                                    setIsVideoOff(false);
                                    setIsMuted(false);
                                }}
                                className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                            >
                                Enter SyncMeet
                                <ChevronUp className="rotate-90 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={() => window.history.back()}
                                className="w-full h-14 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                            >
                                Not Now
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-8 pt-4 border-t border-slate-200 dark:border-white/5">
                            <div className="text-center">
                                <div className="text-xl font-black text-slate-900 dark:text-white leading-none">4.2k</div>
                                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Found Matches</div>
                            </div>
                            <div className="w-px h-8 bg-slate-200 dark:bg-white/10" />
                            <div className="text-center">
                                <div className="text-xl font-black text-slate-900 dark:text-white leading-none">128</div>
                                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Live Rooms</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // --- MAIN MEET UI (MOBILE) ---
    if (isMobile) {
        return (
            <div className="fixed inset-0 bg-background dark:bg-black z-[200] overflow-hidden font-['Poppins',sans-serif]">
                <header className="fixed top-0 left-0 right-0 z-[210] flex items-center justify-between px-4 h-14 bg-transparent">
                    <Logo size="sm" />
                </header>
                <ParticleEffect count={10} />
                <AnimatePresence mode="wait">
                    <motion.div
                        key={person.id}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '-100%' }}
                        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.y < -100) nextPerson();
                            else if (info.offset.y > 100) prevPerson();
                        }}
                        className="absolute inset-0 z-0 bg-slate-50 dark:bg-zinc-900"
                    >
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-black/20 via-transparent to-black/90 md:to-transparent">
                            <div className="w-32 h-32 rounded-full bg-primary/20 animate-pulse border-2 border-primary/40 flex items-center justify-center">
                                <span className="text-4xl font-black text-slate-900 dark:text-white">{person.initials}</span>
                            </div>
                            <p className="mt-6 text-slate-900/30 dark:text-white/30 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Establishing Secure Connection...</p>
                        </div>

                        <div className="absolute bottom-36 left-6 right-6 z-10 pointer-events-none">
                            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white drop-shadow-2xl">{person.name}, {person.age}</h2>
                                    <div className="p-1 bg-primary rounded-lg shadow-lg shadow-primary/20"><Sparkles className="text-white w-4 h-4" /></div>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600 dark:text-white/60">
                                    <MapPin size={16} className="text-primary" />
                                    <span className="text-xs font-bold uppercase tracking-wider">{person.location}</span>
                                </div>
                                <p className="text-slate-800 dark:text-white/80 text-sm font-medium leading-relaxed max-w-xs line-clamp-2">
                                    {person.bio}
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>



                <motion.div drag dragConstraints={{ left: -300, right: 0, top: 0, bottom: 500 }} className="absolute top-28 right-6 w-24 h-36 bg-slate-100 dark:bg-zinc-800 rounded-2xl border-2 border-slate-200 dark:border-white/20 overflow-hidden z-30 shadow-2xl">
                    {!isVideoOff ? <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror scale-x-[-1]" /> : <div className="w-full h-full flex items-center justify-center"><VideoOff size={20} className="text-slate-400 dark:text-white/10" /></div>}
                </motion.div>

                <div className="absolute bottom-4 left-0 right-0 p-4 flex flex-col items-center gap-4 z-40">
                    <AnimatePresence>
                        {showCameraMenu && availableCameras.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="w-full max-w-[280px] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-2xl border border-slate-200 dark:border-white/10 p-2 mb-2 shadow-2xl"
                            >
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 px-2">Select Camera</div>
                                <div className="space-y-1">
                                    {availableCameras.map((camera) => (
                                        <button
                                            key={camera.deviceId}
                                            onClick={() => { setSelectedCameraId(camera.deviceId); setShowCameraMenu(false); }}
                                            className={`w-full px-3 py-2 rounded-xl text-left text-xs font-bold transition-all ${selectedCameraId === camera.deviceId ? 'bg-primary text-white' : 'text-slate-700 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/5'}`}
                                        >
                                            {camera.label || `Camera ${availableCameras.indexOf(camera) + 1}`}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="w-full max-w-[320px] bg-white/40 dark:bg-zinc-950/60 backdrop-blur-3xl border border-slate-200 dark:border-white/10 px-4 py-3 rounded-[3rem] flex items-center justify-around shadow-2xl">
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className={`p-3 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-slate-200 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-white/10'}`}
                        >
                            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>

                        <button
                            onClick={() => window.history.back()}
                            className="p-5 bg-red-600 rounded-full text-white shadow-[0_0_40px_rgba(220,38,38,0.6)] active:scale-90 transition-all border-4 border-black/10"
                        >
                            <PhoneOff size={28} />
                        </button>

                        <button
                            title="Switch Camera"
                            onClick={() => setShowCameraMenu(!showCameraMenu)}
                            className={`p-3 rounded-full transition-all ${showCameraMenu ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' : 'bg-slate-200 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-white/10'}`}
                        >
                            <RefreshCcw size={20} className={showCameraMenu ? 'animate-spin-slow' : ''} />
                        </button>

                        <button
                            onClick={() => {
                                if (isBanned) {
                                    alert('Banned members cannot send requests.');
                                    return;
                                }
                                setFriendRequested(prev => ({ ...prev, [person.id]: !prev[person.id] }))
                            }}
                            className={`p-3 rounded-full transition-all ${isBanned ? 'opacity-30 cursor-not-allowed' : friendRequested[person.id] ? 'bg-green-500/20 text-green-500' : 'bg-slate-200 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-white/10'}`}
                            disabled={isBanned}
                            title={isBanned ? "Your account is restricted" : friendRequested[person.id] ? "Request Sent" : "Add Friend"}
                        >
                            <UserPlus size={20} />
                        </button>

                        <button
                            onClick={() => setIsVideoOff(!isVideoOff)}
                            className={`p-3 rounded-full transition-all ${isVideoOff ? 'bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-slate-200 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-white/10'}`}
                        >
                            {isVideoOff ? <VideoOff size={20} /> : <VideoIcon size={20} />}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- MAIN MEET UI (WEB) ---
    return (
        <div className="fixed inset-0 bg-background dark:bg-[#0c0c0e] text-foreground dark:text-white overflow-hidden font-['Inter',sans-serif] pt-16">
            <header className="fixed top-0 left-0 right-0 z-[210] flex items-center justify-between px-6 h-16 bg-transparent">
                <Logo size="sm" />
            </header>
            <ParticleEffect count={15} />

            {/* Background Decor */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px] animate-pulse" />
            </div>

            <main className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
                {/* Left: User Panel */}
                <div className="flex-1 space-y-8 w-full">
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mb-4">
                            <Sparkles size={14} className="text-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Discover New Mindsets</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-tight text-slate-900 dark:text-white">
                            {person.name}, <span className="text-primary">{person.age}</span>
                        </h1>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-muted-foreground mb-6">
                            <MapPin size={18} className="text-primary" />
                            <span className="text-sm font-bold uppercase tracking-widest">{person.location}</span>
                        </div>
                        <p className="text-lg md:text-xl text-slate-700 dark:text-foreground/70 font-medium leading-relaxed max-w-lg mb-8">
                            {person.bio}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {person.interests?.map(tag => (
                                <span key={tag} className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold transition-colors cursor-default capitalize text-slate-800 dark:text-white">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    <div className="flex items-center gap-6 pt-8">
                        <button onClick={prevPerson} className="w-14 h-14 flex items-center justify-center bg-white/50 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition-all text-slate-900 dark:text-white"><ChevronDown className="rotate-90" /></button>
                        <button onClick={nextPerson} className="px-10 h-14 bg-primary text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all">Next Match</button>
                    </div>
                </div>

                {/* Right: Video & Controls */}
                <div className="flex-1 relative flex justify-end w-full">
                    <div className="relative w-full max-w-[400px] aspect-[4/5.5]">
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary to-purple-600 rounded-[3rem] blur-2xl opacity-20" />
                        <div className="relative w-full h-full bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl">
                            {/* Remote Feed */}
                            <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 4 }} className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-2xl">
                                    <span className="text-4xl md:text-5xl font-black text-white">{person.initials}</span>
                                </motion.div>
                                <div className="text-center">
                                    <h4 className="font-black uppercase tracking-[0.3em] text-xs text-primary mb-2">Syncing Streams</h4>
                                    <p className="text-[10px] text-slate-400 dark:text-white/30 uppercase font-bold tracking-widest">End-to-End Encryption Active</p>
                                </div>
                            </div>

                            {/* Self View */}
                            <div className="absolute top-6 right-6 w-20 h-28 md:w-24 md:h-36 bg-slate-100 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-white/20 shadow-2xl overflow-hidden">
                                {!isVideoOff ? <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror scale-x-[-1]" /> : <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-zinc-900 border border-slate-100 dark:border-white/5"><User className="text-slate-400 dark:text-white/10" /></div>}
                            </div>

                            {/* Float Controls */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-white/80 dark:bg-black/60 backdrop-blur-xl rounded-full border border-slate-200 dark:border-white/10 shadow-lg">
                                <button onClick={() => setIsMuted(!isMuted)} className={isMuted ? 'text-red-500' : 'text-slate-900 dark:text-white'}>{isMuted ? <MicOff size={20} /> : <Mic size={20} />}</button>
                                <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2" />

                                <div className="relative">
                                    <button
                                        title="Switch Camera"
                                        onClick={() => setShowCameraMenu(!showCameraMenu)}
                                        className={showCameraMenu ? 'text-primary' : 'text-slate-900 dark:text-white hover:scale-110 transition-transform'}
                                    >
                                        <RefreshCcw size={20} className={showCameraMenu ? 'animate-spin-slow' : ''} />
                                    </button>
                                    <AnimatePresence>
                                        {showCameraMenu && availableCameras.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-[240px] bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-white/10 p-2 shadow-2xl z-50"
                                            >
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 px-2">Select Camera</div>
                                                <div className="space-y-1">
                                                    {availableCameras.map((camera) => (
                                                        <button
                                                            key={camera.deviceId}
                                                            onClick={(e) => { e.stopPropagation(); setSelectedCameraId(camera.deviceId); setShowCameraMenu(false); }}
                                                            className={`w-full px-3 py-2 rounded-xl text-left text-xs font-bold transition-all ${selectedCameraId === camera.deviceId ? 'bg-primary text-white' : 'text-slate-700 dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/5'}`}
                                                        >
                                                            {camera.label || `Camera ${availableCameras.indexOf(camera) + 1}`}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2" />
                                <button
                                    onClick={() => {
                                        if (isBanned) {
                                            alert('Banned members cannot send requests.');
                                            return;
                                        }
                                        setFriendRequested(prev => ({ ...prev, [person.id]: !prev[person.id] }))
                                    }}
                                    className={`${isBanned ? 'opacity-30 cursor-not-allowed' : friendRequested[person.id] ? 'text-green-500' : 'text-slate-900 dark:text-white hover:scale-110'} transition-transform`}
                                    disabled={isBanned}
                                    title={isBanned ? "Your account is restricted" : friendRequested[person.id] ? "Request Sent" : "Add Friend"}
                                >
                                    <UserPlus size={22} />
                                </button>
                                <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2" />
                                <button onClick={() => setIsVideoOff(!isVideoOff)} className={isVideoOff ? 'text-red-500' : 'text-slate-900 dark:text-white'}>{isVideoOff ? <VideoOff size={20} /> : <VideoIcon size={20} />}</button>
                                <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2" />
                                <button onClick={() => window.history.back()} className="text-red-600 hover:scale-110 transition-transform"><PhoneOff size={24} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
