'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Register() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the unified auth page with register mode
    router.push('/auth/signin?mode=register')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  )
}
