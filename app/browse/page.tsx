'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BookOpen, Star, Eye, Heart, TrendingUp,
  ChevronRight, Play, Info, Plus, Search,
  Sparkles, Trophy, Flame, Zap, Compass,
  Users, Coffee, Palette, BrainCircuit, Check,
  Loader2
} from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author?: {
    username: string;
  } | string;
  description: string;
  coverImage: string;
  rating?: number;
  reads?: string | number;
  category?: {
    name: string;
  } | string;
  isFeatured?: boolean;
  views?: number;
}

const bookCategories = [
  'Fantasy', 'Sci-Fi', 'Romance', 'Mystery', 'Thriller', 'Horror',
  'Historical', 'Biography', 'Self-Help', 'Poetry', 'Classics',
  'Adventure', 'Drama', 'Psychology', 'Philosophy', 'Science'
];

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const [realBooks, setRealBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const containerRef = useRef(null);

  // Sync with URL params
  useEffect(() => {
    const query = searchParams.get('search');
    if (query !== null) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  // Sync with Header Search Custom Event
  useEffect(() => {
    const handleSearchChange = (e: any) => {
      setSearchQuery(e.detail || '');
    };
    window.addEventListener('search-change', handleSearchChange);
    return () => window.removeEventListener('search-change', handleSearchChange);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [readingList, setReadingList] = useState<string[]>([]);

  // Fetch books from API
  const fetchBooks = async (query = '') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/books?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      setRealBooks(data);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load persistence
  useEffect(() => {
    const savedFavs = localStorage.getItem('mb_favorites');
    const savedReading = localStorage.getItem('mb_continue_reading');
    if (savedFavs) {
      try { setFavorites(JSON.parse(savedFavs)); } catch (e) { }
    }
    if (savedReading) {
      try { setReadingList(JSON.parse(savedReading)); } catch (e) { }
    }
  }, []);

  const toggleFavorite = (id: string) => {
    const newFavs = favorites.includes(id)
      ? favorites.filter(fid => fid !== id)
      : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('mb_favorites', JSON.stringify(newFavs));
  };

  const addToContinueReading = (id: string) => {
    const newList = [id, ...readingList.filter(rid => rid !== id)].slice(0, 10);
    setReadingList(newList);
    localStorage.setItem('mb_continue_reading', JSON.stringify(newList));
  };

  // Organize books into categories for display
  const categorizedDisplay = [
    { title: 'Recently Added', icon: <Flame className="w-5 h-5 text-orange-500" />, books: realBooks.slice(0, 10) },
    { title: 'Popular Picks', icon: <Star className="w-5 h-5 text-yellow-500" />, books: [...realBooks].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10) },
    { title: 'Editor\'s Choice', icon: <Sparkles className="w-5 h-5 text-purple-500" />, books: realBooks.filter(b => b.isFeatured).slice(0, 10) }
  ].filter(cat => cat.books.length > 0);

  return (
    <div ref={containerRef} className="min-h-screen bg-transparent text-foreground selection:bg-primary/30">

      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <motion.div
          style={{ scale: heroScale }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent z-10" />
          <img
            src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2000&auto=format&fit=crop"
            className="w-full h-full object-cover opacity-20"
            alt="Hero Background"
          />
        </motion.div>

        <div className="relative z-20 h-full flex flex-col justify-center px-6 md:px-16 lg:px-24 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl text-center md:text-left"
          >
            <h1 className="text-4xl md:text-7xl font-black mb-4 md:mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60 uppercase italic">
              Digital <span className="text-purple-600">Sanctuary</span>
            </h1>
            <p className="text-sm md:text-xl text-foreground/50 dark:text-white/40 font-black uppercase tracking-[0.2em]">
              Your gateway to infinite stories.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Rows Container */}
      <div className="relative z-30 pb-24 space-y-12 md:space-y-20">
        {searchQuery && realBooks.length === 0 && !isLoading ? (
          <div className="text-center py-20 px-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 max-w-lg mx-auto shadow-2xl">
              <Search className="mx-auto text-slate-500 mb-4" size={48} />
              <h3 className="text-2xl font-black mb-2 uppercase">No matches found</h3>
              <p className="text-slate-500">We couldn't find any books matching "{searchQuery}"</p>
            </div>
          </div>
        ) : (
          categorizedDisplay.map((category, idx) => (
            <BookRow
              key={idx}
              title={category.title}
              icon={category.icon}
              books={category.books}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onRead={addToContinueReading}
            />
          ))
        )}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function BookRow({
  title,
  icon,
  books,
  favorites,
  onToggleFavorite,
  onRead
}: {
  title: string,
  icon: React.ReactNode,
  books: Book[],
  favorites: string[],
  onToggleFavorite: (id: string) => void,
  onRead: (id: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 md:p-3 bg-slate-100 dark:bg-white/5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-white/10">
            {icon}
          </div>
          <h2 className="text-xl md:text-3xl font-black tracking-tight uppercase italic">{title}</h2>
        </div>
        <div className="hidden sm:flex gap-2">
          <button onClick={() => scroll('left')} className="p-3 md:p-4 rounded-full bg-background border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 rotate-180" />
          </button>
          <button onClick={() => scroll('right')} className="p-3 md:p-4 rounded-full bg-background border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto no-scrollbar pb-10 pt-4 scroll-smooth"
      >
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            isFavorite={favorites.includes(book.id)}
            onToggleFavorite={() => onToggleFavorite(book.id)}
            onRead={() => onRead(book.id)}
          />
        ))}
      </div>
    </div>
  );
}

function BookCard({
  book,
  isFavorite,
  onToggleFavorite,
  onRead
}: {
  book: Book,
  isFavorite: boolean,
  onToggleFavorite: () => void,
  onRead: () => void
}) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const authorName = typeof book.author === 'object' ? book.author.username : book.author;
  const categoryName = typeof book.category === 'object' ? book.category.name : (book.category || 'General');

  const handleRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRead();
    router.push(`/read/${book.id}`);
  };

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleRead}
      whileHover={{ y: -12 }}
      className="relative flex-none w-[220px] md:w-[260px] aspect-[2/3] group cursor-pointer"
    >
      <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 border-2 border-slate-200 dark:border-white/5 group-hover:border-purple-500 group-hover:shadow-[0_0_40px_rgba(168,85,247,0.4)]">
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 inset-x-0 p-6 z-40"
          >
            <h3 className="font-black text-xl leading-tight mb-1 text-white uppercase">{book.title}</h3>
            <p className="text-sm text-white/60 mb-4 font-bold tracking-wide">by {authorName}</p>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRead}
                className="bg-white text-black p-3.5 rounded-2xl hover:bg-purple-50 transition-all shadow-xl active:scale-90"
              >
                <Play className="w-5 h-5 fill-current" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                className={`p-3.5 rounded-2xl transition-all border border-white/20 backdrop-blur-md active:scale-90 ${isFavorite ? 'bg-red-500 text-white border-red-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isHovered && (
        <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/80 to-transparent rounded-b-3xl">
          <h3 className="font-bold text-base text-white line-clamp-1">{book.title}</h3>
          <p className="text-[10px] text-white/50 font-black uppercase tracking-widest mt-1">{categoryName}</p>
        </div>
      )}
    </motion.div>
  );
}

