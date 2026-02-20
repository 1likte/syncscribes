import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16'
  })

  try {
    const {
      username,
      password,
      firstName,
      lastName,
      email,
      phone,
      bio,
      avatar,
      planId
    } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured on the server' }, { status: 500 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    }).catch(err => {
      console.error('Prisma check error:', err)
      throw new Error(`Database error: ${err.message}`)
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
    }

    // Create Stripe checkout session with registration data in metadata
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card', 'paypal'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Premium Reading Subscription',
              description: 'Unlimited access to all books'
            },
            unit_amount: 200, // €2.00 in cents
            recurring: {
              interval: 'month',
              interval_count: 1
            }
          },
          quantity: 1
        }
      ],
      metadata: {
        username: String(username),
        password: String(password),
        firstName: String(firstName || ''),
        lastName: String(lastName || ''),
        email: String(email || ''),
        phone: String(phone || ''),
        bio: String(bio || ''),
        avatar: String(avatar || ''),
        registrationFlow: 'true'
      },
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/register?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/register`
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })

  } catch (error: any) {
    console.error('Registration checkout error FULL:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    }, { status: 500 })
  }
}

