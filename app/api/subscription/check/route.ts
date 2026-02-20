import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find user by id
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        subscriptionStatus: true,
        subscriptionEndsAt: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const hasActiveSubscription =
      user.subscriptionStatus === 'ACTIVE' &&
      user.subscriptionEndsAt &&
      new Date(user.subscriptionEndsAt) > new Date()

    return NextResponse.json({
      hasActiveSubscription,
      status: user.subscriptionStatus,
      expiresAt: user.subscriptionEndsAt
    })

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Subscription check error:', error)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
