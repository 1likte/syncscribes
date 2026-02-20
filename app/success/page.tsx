'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CheckCircle, BookOpen, Download, Home } from 'lucide-react'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [purchaseDetails, setPurchaseDetails] = useState<any>(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      router.push('/books')
      return
    }

    // Burada ödeme detaylarını API'den çekeceğiz
    // Şimdilik mock veri kullanıyoruz
    const mockPurchaseDetails = {
      bookTitle: 'The Digital Revolution',
      authorName: 'Sarah Johnson',
      amount: 19.99,
      purchaseDate: new Date().toISOString(),
      downloadUrl: '/api/download/sample-book.pdf'
    }

    setPurchaseDetails(mockPurchaseDetails)
    setIsLoading(false)
  }, [searchParams, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-green-50 px-6 py-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
            >
              <CheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-green-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-green-700">
              Thank you for your purchase. Your book is now available.
            </p>
          </div>

          <div className="px-6 py-6">
            {purchaseDetails && (
              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Purchase Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Book:</span>
                      <span className="font-medium">{purchaseDetails.bookTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Author:</span>
                      <span className="font-medium">{purchaseDetails.authorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">${purchaseDetails.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {new Date(purchaseDetails.purchaseDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link href={purchaseDetails.downloadUrl}>
                    <Button className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Book
                    </Button>
                  </Link>
                  
                  <Link href={`/books/${purchaseDetails.bookId || '1'}`}>
                    <Button variant="outline" className="w-full">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Read Online
                    </Button>
                  </Link>
                  
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full">
                      <Home className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4 text-center">
              <p className="text-sm text-gray-600 mb-2">
                A confirmation email has been sent to your registered email address.
              </p>
              <p className="text-sm text-gray-600">
                Need help?{' '}
                <Link href="/support" className="text-blue-600 hover:text-blue-500">
                  Contact Support
                </Link>
              </p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 text-center"
        >
          <Link href="/books" className="text-blue-600 hover:text-blue-500 text-sm">
            ← Continue Shopping
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
