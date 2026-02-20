import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's active subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (user?.stripeSubscriptionId && user?.subscriptionStatus === 'ACTIVE') {
      try {
        const { stripe } = await import('@/lib/stripe')
        await stripe.subscriptions.cancel(user.stripeSubscriptionId)
      } catch (error) {
        console.error('Error canceling Stripe subscription:', error)
        // Continue even if Stripe cancel fails
      }

      // Update user subscription status
      await prisma.user.update({
        where: { id: user.id },
        data: { subscriptionStatus: 'CANCELED' }
      })
    }

    return NextResponse.json({ message: 'Subscription canceled successfully' })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

