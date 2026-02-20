'use client'

import { useRouter } from 'next/navigation'

export default function JoinPage() {
  const router = useRouter()
  
  // Redirect to sign in page
  router.push('/auth/signin')
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white">Redirecting...</div>
    </div>
  )
}

