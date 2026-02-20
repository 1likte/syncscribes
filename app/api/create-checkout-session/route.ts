import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { priceId, successUrl, cancelUrl } = body

        // Simplified session check
        // const session = await getServerSession()
        // if (!session?.user) return new NextResponse("Unauthorized", { status: 401 })

        // Create Checkout Session
        const stripeSession = await stripe.checkout.sessions.create({
            success_url: successUrl || 'http://localhost:3000/success',
            cancel_url: cancelUrl || 'http://localhost:3000/cancel',
            payment_method_types: ['card', 'paypal'],
            mode: 'payment', // or 'subscription'
            billing_address_collection: 'auto',
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: 'Premium Content Access',
                            description: 'Unlock 24h Premium Access',
                        },
                        unit_amount: 200, // 2.00 EUR
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                userId: "user_123" // Replace with actual user ID
            },
        })

        return NextResponse.json({ url: stripeSession.url })
    } catch (error) {
        console.error('[STRIPE_POST]', error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
