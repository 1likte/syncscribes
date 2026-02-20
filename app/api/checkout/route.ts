import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookId } = await request.json()

    if (!bookId) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 })
    }

    // Kitabı veritabanından al
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    })

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    // Kullanıcının bu kitabı daha önce satın alıp almadığını kontrol et
    if (!session.user?.id) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        bookId: bookId
      }
    })

    if (existingPurchase) {
      return NextResponse.json({ error: 'Book already purchased' }, { status: 400 })
    }

    // Stripe checkout session oluştur
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: book.title,
              description: book.description,
              images: book.coverImage ? [book.coverImage] : []
            },
            unit_amount: Math.round((book.price || 0) * 100) // Stripe cent olarak çalışır
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/books/${bookId}`,
      metadata: {
        bookId: book.id,
        userId: session.user.id!
      }
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })
  } catch (error) {
    // Log error (guarded for production)
    if (process.env.NODE_ENV !== 'production') {
      console.error('Checkout error:', error)
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
