'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Home, Mail, Lock, User, Facebook, Github, Linkedin, Eye, EyeOff, Sparkles, CreditCard, Book, MessageCircle, BookOpen, Globe, LifeBuoy, Zap, Award } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AuthPage() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')

  const [isRegisterMode, setIsRegisterMode] = useState(mode === 'register')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (mode === 'register') setIsRegisterMode(true)
  }, [mode])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid username or password')
      } else {
        router.push('/profile')
        router.refresh()
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    // Registration requires payment as per current logic
    sessionStorage.setItem('pendingRegistration', JSON.stringify({ username, password }))
    router.push('/subscription?register=true')
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-start md:items-center justify-center bg-transparent transition-colors duration-500 relative font-['Poppins', sans-serif] selection:bg-primary/30 pt-4 md:pt-10 pb-20 md:py-0">

      <div className="relative w-full max-w-[900px] min-h-[500px] md:min-h-[600px] m-4 group mt-10 md:mt-0">
        {/* Neon Glow Frame */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-[2.5rem] opacity-20 group-hover:opacity-40 blur-xl transition duration-500" />

        <div className="relative w-full h-full bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 transition-all duration-500 z-10 flex min-h-[500px] md:min-h-[600px] shadow-2xl">

          {/* Forms Container */}
          <div className="absolute inset-0 flex">
            {/* Sign In Form */}
            <motion.div
              initial={false}
              animate={{
                x: isRegisterMode ? '100%' : '0%',
                opacity: isRegisterMode ? 0 : 1,
                zIndex: isRegisterMode ? 0 : 20,
              }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              className={`absolute top-0 left-0 w-1/2 h-full flex items-center justify-center bg-transparent p-6 md:p-12 max-md:w-full ${isRegisterMode ? 'pointer-events-none' : ''}`}
            >
              <form onSubmit={handleSignIn} className="w-full flex flex-col items-center text-center">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 transition-colors tracking-tight uppercase">Sign In</h1>
                <p className="text-slate-500 dark:text-white/50 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-6 md:mb-8 transition-colors">Enter your credentials to access the vault</p>

                <div className="flex gap-4 mb-6 md:mb-8">
                  {[Facebook, Github, Linkedin].map((Icon, i) => (
                    <button key={i} type="button" className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-primary/50 transition-all hover:-translate-y-1">
                      <Icon size={18} />
                    </button>
                  ))}
                </div>

                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/20 mb-6">Internal Access Protocol</span>

                <div className="w-full space-y-3 md:space-y-4">
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-300 dark:text-white/30 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="Username"
                      className="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-3 md:py-4 pl-12 pr-4 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/20 text-xs md:text-sm"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                    />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-300 dark:text-white/30 group-focus-within:text-primary transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      className="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-3 md:py-4 pl-12 pr-12 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/20 text-xs md:text-sm"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-white/30 hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-red-500 dark:text-red-400 text-[10px] mt-4 font-black uppercase tracking-wider">{error}</p>}

                <Link href="#" className="text-[10px] text-primary font-black uppercase tracking-widest mt-4 md:mt-5 hover:underline">Forgot password?</Link>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white font-black py-3 md:py-4 rounded-2xl mt-6 md:mt-8 shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none uppercase tracking-widest text-[11px]"
                >
                  {isLoading ? 'Decrypting Access...' : 'Initiate Access'}
                </button>

                <div className="mt-8 text-slate-400 dark:text-white/30 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors">
                  No account?
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(true)}
                    className="text-primary font-black ml-2 hover:underline transition-all"
                  >
                    Register New ID
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Sign Up Form */}
            <motion.div
              initial={false}
              animate={{
                x: isRegisterMode ? '0%' : '-100%',
                opacity: isRegisterMode ? 1 : 0,
                zIndex: isRegisterMode ? 20 : 0,
              }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              className={`absolute top-0 right-0 w-1/2 h-full flex items-center justify-center bg-transparent p-6 md:p-12 max-md:w-full ${!isRegisterMode ? 'pointer-events-none' : ''}`}
            >
              <form onSubmit={handleRegister} className="w-full flex flex-col items-center text-center">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 transition-colors tracking-tight uppercase">Sign Up</h1>
                <p className="text-slate-500 dark:text-white/50 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-6 md:mb-8 transition-colors">Create your digital fingerprint</p>

                <div className="w-full bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-4 md:p-5 mb-6 md:mb-8 text-left transition-colors">
                  <div className="flex items-center gap-3 text-primary mb-1 md:mb-2">
                    <CreditCard size={16} />
                    <span className="font-black text-[9px] md:text-[10px] uppercase tracking-widest">Premium Enrolment Required</span>
                  </div>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-500 dark:text-white/40 leading-relaxed uppercase tracking-tight">Post-registration: Redirecting to secure payment protocol for full access.</p>
                </div>

                <div className="w-full space-y-3 md:space-y-4">
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-300 dark:text-white/30 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="Username"
                      className="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-3 md:py-4 pl-12 pr-4 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/20 text-xs md:text-sm"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-300 dark:text-white/30 group-focus-within:text-primary transition-colors" />
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-3 md:py-4 pl-12 pr-4 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/20 text-xs md:text-sm"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-300 dark:text-white/30 group-focus-within:text-primary transition-colors" />
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      className="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl py-3 md:py-4 pl-12 pr-4 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/20 text-xs md:text-sm"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {error && <p className="text-red-500 dark:text-red-400 text-[10px] mt-4 font-black uppercase tracking-wider">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white font-black py-3 md:py-4 rounded-2xl mt-6 md:mt-8 shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none uppercase tracking-widest text-[11px] flex items-center justify-center gap-3"
                >
                  {isLoading ? 'Redeployment...' : 'Verify & Continue'}
                  <Sparkles size={14} />
                </button>

                <div className="mt-8 text-slate-400 dark:text-white/30 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors">
                  Existing fingerprint?
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(false)}
                    className="text-primary font-black ml-2 hover:underline transition-all"
                  >
                    Initiate Access
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Overlay Panels (Desktop Only) */}
          <motion.div
            animate={{ x: isRegisterMode ? '-100%' : '0%' }}
            transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute top-0 left-1/2 w-1/2 h-full overflow-hidden z-[50] max-md:hidden shadow-[-20px_0_50px_rgba(0,0,0,0.1)] dark:shadow-[-20px_0_50px_rgba(0,0,0,0.5)] border-l border-slate-100 dark:border-white/10"
          >
            <motion.div
              animate={{ x: isRegisterMode ? '0%' : '50%' }}
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative left-[-100%] h-full w-[200%] bg-white dark:bg-[#030712] transition-colors duration-500 overflow-hidden"
            >
              {/* Vibrant Homepage-Style Mesh Background */}
              <div className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000">
                {/* Orbs */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1], x: [0, 50, 0], y: [0, -30, 0] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-[10%] -left-[10%] w-[70%] h-[70%] bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-blue-600 dark:to-cyan-500 blur-[120px] rounded-full opacity-30 dark:opacity-40"
                />
                <motion.div
                  animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0], y: [0, 30, 0] }}
                  transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-[10%] -right-[10%] w-[70%] h-[70%] bg-gradient-to-br from-purple-400 to-pink-500 dark:from-purple-600 dark:to-pink-500 blur-[120px] rounded-full opacity-30 dark:opacity-40"
                />
                <div className="absolute inset-0 bg-white/20 dark:bg-[#030712]/30 backdrop-blur-[2px]" />
              </div>

              {/* Content Layer */}
              <div className="absolute inset-0 flex z-20">
                <div className="w-1/2 h-full flex flex-col items-center justify-center p-14 text-center relative overflow-hidden">
                  <motion.div animate={{ opacity: isRegisterMode ? 0 : 1, scale: isRegisterMode ? 0.9 : 1 }} transition={{ duration: 0.4 }} className="w-full">
                    <div className="relative mb-8 h-32 flex items-center justify-center">
                      <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity }} className="w-24 h-24 bg-white/40 dark:bg-white/15 backdrop-blur-3xl rounded-[2.5rem] border border-blue-200 dark:border-white/20 shadow-xl flex items-center justify-center">
                        <BookOpen size={44} className="text-blue-600 dark:text-white" />
                      </motion.div>
                    </div>
                    <h1 className="text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter italic">Sync<span className="text-primary">Scribes</span></h1>
                    <button onClick={() => setIsRegisterMode(true)} className="px-14 py-5 bg-primary text-white rounded-full font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:scale-105 transition-all">Register & Explore</button>
                  </motion.div>
                </div>

                <div className="w-1/2 h-full flex flex-col items-center justify-center p-14 text-center relative overflow-hidden">
                  <motion.div animate={{ opacity: isRegisterMode ? 1 : 0, scale: isRegisterMode ? 1 : 0.9 }} transition={{ duration: 0.4 }} className="w-full">
                    <div className="relative mb-10 h-32 flex items-center justify-center">
                      <div className="flex -space-x-4">
                        {[1, 2, 3].map((i) => (
                          <motion.div key={i} animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }} className="w-16 h-16 rounded-2xl border-4 border-white dark:border-[#030712] shadow-2xl overflow-hidden"><img src={`https://i.pravatar.cc/150?u=${i + 20}`} className="w-full h-full object-cover" /></motion.div>
                        ))}
                      </div>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter italic">Sync<span className="text-primary">Scribes</span></h1>
                    <button onClick={() => setIsRegisterMode(false)} className="px-14 py-5 bg-transparent border-2 border-slate-200 dark:border-white/20 rounded-full font-black uppercase tracking-[0.3em] text-[10px] text-slate-600 dark:text-white hover:border-primary transition-all shadow-xl">Back to Sign In</button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
