'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Crown, Star, Check, ArrowRight, BookOpen, Users, Zap, ShieldCheck, Heart, Sparkles } from 'lucide-react'

export default function SubscriptionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isRegisterFlow = searchParams.get('register') === 'true'
  const [isLoading, setIsLoading] = useState(false)
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
  const [pendingRegistration, setPendingRegistration] = useState<{
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    username: string
    password: string
    bio?: string
    avatar?: string | null
  } | null>(null)

  useEffect(() => {
    if (isRegisterFlow) {
      const stored = sessionStorage.getItem('pendingRegistration')
      if (stored) {
        try {
          setPendingRegistration(JSON.parse(stored))
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, [isRegisterFlow])


  useEffect(() => {
    const checkSubscription = async () => {
      if (session) {
        try {
          const response = await fetch('/api/subscription/check')
          const data = await response.json()
          setHasActiveSubscription(data.hasActiveSubscription)
        } catch (error) {
          console.error('Error checking subscription:', error)
        }
      }
    }

    checkSubscription()
  }, [session])

  const handleSubscribe = async () => {
    if (isRegisterFlow && pendingRegistration) {
      setIsLoading(true)

      try {
        const response = await fetch('/api/subscription/create-checkout-for-registration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...pendingRegistration,
            planId: 'basic-monthly' // Legacy ID but we treat as one-time in UI
          })
        })

        const data = await response.json()

        if (response.ok && data.url) {
          sessionStorage.removeItem('pendingRegistration')
          window.location.href = data.url
        } else {
          alert(data.details ? `${data.error}: ${data.details}` : (data.error || 'Failed to create checkout session'))
        }
      } catch (error) {
        alert('An error occurred. Please try again.')
      } finally {
        setIsLoading(false)
      }
      return
    }

    if (!session) {
      router.push('/auth/signin')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: 'basic-monthly'
        })
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Subscription error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff2d75]"></div>
      </div>
    )
  }

  useEffect(() => {
    if (session && !isRegisterFlow && hasActiveSubscription) {
      router.replace('/')
    }
  }, [session, isRegisterFlow, hasActiveSubscription, router])

  if (session && !isRegisterFlow && hasActiveSubscription) {
    return null // Render nothing while redirecting
  }

  return (
    <div className="relative min-h-screen bg-transparent overflow-hidden selection:bg-[#ff2d75]/30">

      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#ff2d75]/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6 pt-10 md:pt-20 pb-12">
        <div className="max-w-5xl mx-auto">

          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <motion.div
              className="relative w-24 h-24 mx-auto mb-8"
            >
              <div className="absolute inset-0 bg-amber-500/30 blur-[40px] rounded-full animate-pulse" />
              <div className="absolute inset-0 bg-yellow-400/20 blur-[20px] rounded-full" />

              <div
                className="relative z-10 w-full h-full flex items-center justify-center"
              >
                <Crown className="w-full h-full text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)] fill-amber-300/20" />

                {/* Golden Shine Effect - Stays but crown is static */}
                <motion.div
                  animate={{ left: ['-100%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 pointer-events-none z-20"
                />
              </div>
            </motion.div>

            <h1 className="text-3xl md:text-5xl font-black text-foreground mb-2 uppercase tracking-[-0.05em] leading-[0.9]">
              Unlock <span className="text-[#ff2d75] drop-shadow-[0_0_15px_rgba(255,45,117,0.5)]">Unlimited</span><br />
              <span className="italic">Knowledge</span> & Connection
            </h1>

            <p className="max-w-xl mx-auto text-xs text-foreground/40 uppercase tracking-[0.4em] font-black mt-2">
              The only key you'll ever need
            </p>
          </motion.div>


          <div className="grid lg:grid-cols-5 gap-12 items-center">

            {/* Left: Features List */}
            <div className="lg:col-span-3 space-y-10">
              <div className="grid gap-8">
                {[
                  { icon: BookOpen, title: "Infinite Reading", desc: "Access 1,000+ premium books with no limits or extra costs." },
                  { icon: Heart, title: "Unlimited People", desc: "Connect with the community without any conversation limits." },
                  { icon: ShieldCheck, title: "Respectful Community", desc: "Access high-quality, verified members and filtered spaces." },
                  { icon: Star, title: "Premium Badge", desc: "Stand out with a unique legacy badge on your profile." },
                  { icon: Zap, title: "Pure Experience", desc: "Zero ads, zero interruptions. Just you and the knowledge." }
                ].map((item, idx) => (
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    key={idx}
                    className="flex gap-6 group"
                  >
                    <div className="flex-none w-14 h-14 bg-foreground/5 backdrop-blur-md rounded-2xl border border-foreground/10 flex items-center justify-center group-hover:border-[#ff2d75]/50 group-hover:shadow-[0_0_20px_rgba(255,45,117,0.2)] transition-all duration-500">
                      <item.icon className="w-6 h-6 text-foreground/70 group-hover:text-[#ff2d75] transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-1">{item.title}</h3>
                      <p className="text-foreground/50 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Checkout Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              className="lg:col-span-2 relative group"
            >
              {/* Outer Glow */}
              <div className="absolute inset-0 bg-[#ff2d75]/10 blur-[60px] rounded-[3rem] group-hover:bg-[#ff2d75]/20 transition-all duration-700" />

              <div className="relative bg-white/5 dark:bg-black/40 backdrop-blur-3xl rounded-[3rem] border-2 border-white/10 p-10 shadow-2xl overflow-hidden hover:border-[#ff2d75]/30 transition-all duration-500">

                <div className="absolute top-0 right-0 p-6">
                  <Sparkles className="text-[#ff2d75] animate-pulse" />
                </div>

                <div className="text-center mb-10">
                  <span className="inline-block px-4 py-1.5 bg-[#ff2d75]/10 rounded-full text-[#ff2d75] text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                    Best Value
                  </span>
                  <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">Full Access</h2>
                  <div className="flex items-end justify-center gap-1 my-6">
                    <span className="text-6xl font-black text-foreground tracking-tighter">€2</span>
                    <span className="text-lg text-foreground/40 font-bold mb-2 uppercase tracking-widest">/mo</span>
                  </div>
                  <p className="text-foreground/40 text-sm font-bold uppercase tracking-wider">Monthly Subscription</p>

                </div>


                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3 p-4 bg-foreground/5 rounded-2xl border border-foreground/5">
                    <Check className="text-[#ff2d75]" size={20} />
                    <span className="font-bold text-sm text-foreground/80">Lifetime Portal Access</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-foreground/5 rounded-2xl border border-foreground/5">
                    <Check className="text-[#ff2d75]" size={20} />
                    <span className="font-bold text-sm text-foreground/80">Unlimited Conversations</span>
                  </div>
                </div>

                <Button
                  onClick={handleSubscribe}
                  disabled={isLoading || (isRegisterFlow && !pendingRegistration)}
                  className="w-full bg-[#ff2d75] hover:bg-[#ff2d75]/90 text-white font-black py-8 rounded-2xl text-lg shadow-[0_15px_30px_rgba(255,45,117,0.4)] hover:shadow-[0_20px_40px_rgba(255,45,117,0.5)] transition-all active:scale-95 group/btn overflow-hidden relative"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isLoading ? 'Processing...' : 'Unlock Now'}
                    {!isLoading && <ArrowRight className="group-hover/btn:translate-x-1 transition-transform" />}
                  </span>

                  {/* Subtle animation for button */}
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                  />
                </Button>

                <p className="text-center text-[10px] text-foreground/30 mt-6 font-bold uppercase tracking-widest">
                  Secure checkout via Stripe
                </p>
              </div>
            </motion.div>

          </div>

          {/* Footer Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-20 text-foreground/20 text-[10px] font-black uppercase tracking-[0.5em]"
          >
            Become part of the knowledge revolution
          </motion.p>

        </div>
      </div>
    </div>
  )
}

