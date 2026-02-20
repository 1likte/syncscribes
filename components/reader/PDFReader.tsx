'use client';

import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import {
  Volume2, Sun, Moon, Bookmark, Type, AlertCircle, ChevronLeft, Heart, Layers, MessageSquare, Send, X, User
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import MouseWaveBackground from '@/components/MouseWaveBackground';

// CSS Imports for React PDF
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// WORKER CONFIGURATION
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;
}

interface PDFReaderProps {
  fileUrl: string;
  bookId?: string;
}

export default function PDFReader({ fileUrl, bookId }: PDFReaderProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(0);
  const [isDocumentReady, setIsDocumentReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [scale, setScale] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [initialPage, setInitialPage] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const bookRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Responsive Dimensions
  const [bookDimensions, setBookDimensions] = useState({ width: 550, height: 780 });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        const w = window.innerWidth - 40;
        const h = w * 1.41; // A4 aspect ratio
        setBookDimensions({ width: w, height: h });
      } else {
        setBookDimensions({ width: 550, height: 780 });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    audioRef.current = new Audio('https://www.soundjay.com/misc/sounds/page-flip-01a.mp3');
    if (bookId) {
      fetch(`/api/books/progress?bookId=${bookId}`)
        .then(res => res.json())
        .then(data => {
          const savedPage = (data?.page || 1) - 1;
          setInitialPage(savedPage);
          setPageNumber(savedPage);
          setIsLiked(data?.isLiked || false);
          setIsSaved(data?.isSaved || false);
        })
        .catch(() => setInitialPage(0));
    } else {
      setInitialPage(0);
    }
  }, [bookId]);

  const handleLike = async () => {
    const newState = !isLiked;
    setIsLiked(newState);
    if (bookId) {
      await fetch('/api/books/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, isLiked: newState })
      });
    }
  };

  const handleSave = async () => {
    const newState = !isSaved;
    setIsSaved(newState);
    if (bookId) {
      await fetch('/api/books/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, isSaved: newState })
      });
    }
  };

  const fetchComments = async () => {
    if (!bookId) return;
    setIsLoadingComments(true);
    try {
      const res = await fetch(`/api/books/${bookId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handlePostComment = async () => {
    if (!bookId || !newComment.trim() || isSubmittingComment) return;
    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/books/${bookId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      });
      if (res.ok) {
        const comment = await res.json();
        setComments([comment, ...comments]);
        setNewComment('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, bookId]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setTimeout(() => setIsDocumentReady(true), 200);
  };

  const onPageFlip = (e: any) => {
    const newPage = e.data;
    setPageNumber(newPage);
    if (audioRef.current && !isMuted) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => { });
    }
    if (bookId) {
      fetch('/api/books/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, page: newPage + 1 })
      }).catch(() => { });
    }
  };

  if (initialPage === null) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0c] flex items-center justify-center z-[200]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-white/20 font-black tracking-[0.4em] uppercase text-[10px]">SyncScribes Protocol...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[200] flex flex-col ${themeMode === 'dark' ? 'bg-[#0a0a0c] text-white font-[#inter]' : 'bg-[#f5f5f7] text-black font-[#inter]'} overflow-hidden transition-colors duration-500`}>
      <MouseWaveBackground theme={themeMode} />

      {/* TOP HEADER - Mobile Optimized */}
      <header className="relative z-[220] h-16 md:h-20 flex items-center justify-between px-6 md:px-10 pointer-events-auto">
        <Link href="/browse" className="flex items-center gap-2 group p-2 bg-white/5 backdrop-blur-xl border border-white/5 rounded-2xl">
          <ChevronLeft className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] hidden sm:inline opacity-60 group-hover:opacity-100">Library Vault</span>
        </Link>

        {/* Branded Middle Title */}
        <div className="hidden md:flex flex-col items-center">
          <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-primary">Library Intelligence</h2>
          <p className="text-[8px] font-bold opacity-30 mt-1 uppercase tracking-widest">Protocol Active v4.2</p>
        </div>

        <div className="flex items-center gap-3 bg-white/5 dark:bg-black/20 backdrop-blur-3xl border border-white/10 p-1 rounded-2xl md:rounded-full">
          <button onClick={() => setIsMuted(!isMuted)} className={`p-2.5 transition-colors ${isMuted ? 'text-red-500' : 'opacity-40 hover:opacity-100'}`}>
            <Volume2 size={18} />
          </button>
          <button
            onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            className={`p-2.5 rounded-xl md:rounded-full transition-all flex items-center gap-2 ${themeMode === 'dark' ? 'bg-primary text-white border border-primary/50 shadow-lg shadow-primary/20' : 'bg-zinc-800 text-white border border-white/10'}`}
          >
            {themeMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span className="text-[9px] font-black uppercase tracking-widest md:hidden">Mode</span>
          </button>
        </div>
      </header>

      {/* MAIN READER AREA */}
      <main className="flex-grow flex items-center justify-center relative px-2 md:px-4 overflow-hidden py-4 md:py-10">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(e) => setLoadError(e.message)}
          loading={
            <div className="flex flex-col items-center gap-4 animate-pulse">
              <div className="relative w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-y-0 w-1/2 bg-primary" />
              </div>
              <span className="text-[9px] font-black tracking-[0.4em] uppercase opacity-20">Decoding Intelligence Layers...</span>
            </div>
          }
        >
          {isDocumentReady && numPages && (
            <div className={`animate-in fade-in duration-1000 ${isMobile ? 'scale-[1.02]' : ''}`}>
              {/* @ts-ignore */}
              <HTMLFlipBook
                width={bookDimensions.width}
                height={bookDimensions.height}
                size="fixed"
                minWidth={300}
                maxWidth={bookDimensions.width * 2}
                minHeight={400}
                maxHeight={bookDimensions.height * 2}
                showCover={false}
                onFlip={onPageFlip}
                className="shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
                ref={bookRef}
                usePortrait={isMobile}
                drawShadow={true}
                flippingTime={800}
                startPage={initialPage}
              >
                {[...Array(numPages)].map((_, i) => {
                  const isVisible = Math.abs(i - pageNumber) <= 3;
                  return (
                    <div key={i} className="bg-white" style={{ width: bookDimensions.width, height: bookDimensions.height }}>
                      {isVisible ? (
                        <Page
                          pageNumber={i + 1}
                          width={bookDimensions.width}
                          scale={scale}
                          renderTextLayer={true}
                          renderAnnotationLayer={false}
                          loading={null}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 font-sans">
                          <Layers size={48} className="text-zinc-100 mb-4" />
                          <span className="text-zinc-200 text-sm font-black uppercase tracking-widest">LAYER {i + 1}</span>
                        </div>
                      )}
                      <div className={`absolute inset-y-0 ${i % 2 === 0 ? 'left-0 bg-gradient-to-r' : 'right-0 bg-gradient-to-l'} from-black/5 to-transparent w-10 pointer-events-none z-10`} />
                    </div>
                  );
                })}
              </HTMLFlipBook>
            </div>
          )}
        </Document>

        {loadError && (
          <div className="flex flex-col items-center gap-6 p-8 md:p-12 bg-black/90 backdrop-blur-3xl rounded-[40px] border border-red-500/20 z-[250] mx-6">
            <AlertCircle size={48} className="text-red-500 animate-pulse" />
            <div className="text-center">
              <h2 className="text-xl font-black uppercase tracking-tighter text-white">SYNC INTERRUPTED</h2>
              <p className="text-[9px] text-white/40 mt-2 italic max-w-xs">{loadError}</p>
            </div>
            <button onClick={() => window.location.reload()} className="px-8 py-3 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 transition-all">Re-initialize</button>
          </div>
        )}
      </main>

      {/* FOOTER CONTROLS - Neon Mobile UI */}
      <footer className="relative z-[220] h-28 md:h-36 flex flex-col items-center justify-center gap-4 md:gap-6 pb-6 md:pb-8">
        <div className="px-5 py-1.5 bg-white/5 border border-white/5 rounded-full backdrop-blur-xl">
          <span className="text-[9px] font-black tracking-[0.4em] uppercase opacity-40">
            SEQUENCE {pageNumber + 1} // {numPages || '...'}
          </span>
        </div>

        <div className="w-full max-w-lg flex items-center justify-around md:justify-between px-4">
          <div className="flex items-center gap-1 bg-white/5 border border-white/5 p-1 rounded-2xl shadow-xl shadow-black/20">
            <button onClick={() => setScale(Math.max(0.5, scale - 0.1))} className="p-2.5 text-white/40 hover:text-white transition-all"><Type size={16} /></button>
            <div className="w-px h-4 bg-white/10" />
            <span className="text-[10px] font-black min-w-[35px] text-center">{Math.round(scale * 100)}%</span>
            <div className="w-px h-4 bg-white/10" />
            <button onClick={() => setScale(Math.min(2.0, scale + 0.1))} className="p-2.5 text-white/40 hover:text-white transition-all"><Type size={20} /></button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowComments(true)}
              className="p-4 rounded-[1.5rem] border border-white/5 bg-white/5 text-white/30 hover:text-blue-500 transition-all shadow-xl"
            >
              <MessageSquare size={20} />
            </button>
            <button
              onClick={handleLike}
              className={`p-4 rounded-[1.5rem] border transition-all shadow-xl ${isLiked ? 'bg-pink-500/10 text-pink-500 border-pink-500/50 shadow-pink-500/20' : 'bg-white/5 border-white/5 text-white/30 hover:text-pink-500'}`}
            >
              <Heart size={20} className={isLiked ? 'fill-current' : ''} />
            </button>
            <button
              onClick={handleSave}
              className={`p-4 rounded-[1.5rem] border transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] ${isSaved ? 'bg-primary text-white border-primary shadow-primary/50' : 'bg-white/5 border-white/5 text-white/30 hover:text-primary'}`}
            >
              <Bookmark size={20} className={isSaved ? 'fill-current' : ''} />
            </button>
          </div>
        </div>
      </footer>

      {/* COMMENT PANEL */}
      <AnimatePresence>
        {showComments && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComments(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 inset-y-0 w-full max-w-[400px] bg-[#0c0c0e] border-l border-white/10 z-[310] flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <MessageSquare size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-black uppercase tracking-widest text-xs">Reader Insights</h3>
                    <p className="text-[10px] text-white/20 uppercase font-bold tracking-tighter mt-0.5">Community Discussion</p>
                  </div>
                </div>
                <button onClick={() => setShowComments(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {isLoadingComments ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Syncing Thoughts...</span>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 opacity-20">
                    <MessageSquare size={40} className="mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">No insights yet. Be the first.</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="space-y-3 group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                            {comment.user.avatar ? <img src={comment.user.avatar} className="w-full h-full object-cover" /> : <User size={12} className="text-white/20" />}
                          </div>
                          <span className="text-[10px] font-black text-white/60">@{comment.user.username}</span>
                        </div>
                        <span className="text-[8px] font-bold text-white/10 uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 transition-colors hover:border-white/10">
                        <p className="text-sm text-white/80 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-3xl">
                <div className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your insight..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-primary/50 transition-all resize-none h-24"
                  />
                  <button
                    onClick={handlePostComment}
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="absolute bottom-4 right-4 p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none hover:scale-110 active:scale-95 transition-all"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .stf__parent { background: transparent !important; }
        .stf__block { background: transparent !important; }
        canvas { display: block !important; margin: 0 auto; border-radius: 4px; }
        .react-pdf__Page__textLayer { 
           opacity: 1 !important; 
           color: transparent !important;
           display: block !important;
        }
        .react-pdf__Page__textLayer span {
          color: black !important;
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
