import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        _count: {
          select: {
            authoredBooks: true,
            purchases: true,
            reviews: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has active subscription
    const hasActiveSubscription = user.subscriptionStatus === 'ACTIVE' &&
      (user.subscriptionEndsAt ? new Date(user.subscriptionEndsAt) > new Date() : false)

    return NextResponse.json({
      id: user.id,
      username: user.username,
      name: user.username,
      email: user.email,
      role: user.role,
      bio: user.bio || '',
      avatar: user.avatar || '/api/placeholder/150/150',
      phone: user.phone || '',
      gender: user.gender || '',
      birthday: user.birthday,
      emailVisible: user.emailVisible,
      phoneVisible: user.phoneVisible,
      birthdayVisible: user.birthdayVisible,
      isPrivate: user.isPrivate,
      isVerified: user.isVerified,
      profileSlug: user.profileSlug || user.username,
      interests: JSON.parse(user.interests || '[]'),
      level: user.level || 1,
      xp: user.xp || 0,
      verifiedTier: user.verifiedTier || 'NONE',
      joinDate: user.createdAt.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
      booksRead: user._count.purchases,
      postsCount: 0,
      likesReceived: 0,
      hasActiveSubscription,
      subscription: hasActiveSubscription ? {
        stripeSubscriptionId: user.stripeSubscriptionId,
        status: user.subscriptionStatus,
        currentPeriodEnd: user.subscriptionEndsAt
      } : null
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      bio, avatar, username, website, twitter, instagram, facebook, linkedin,
      phone, gender, birthday, emailVisible, phoneVisible, birthdayVisible,
      isPrivate, profileSlug, interests
    } = body

    const updateData: any = {}
    if (bio !== undefined) updateData.bio = bio
    if (avatar !== undefined) updateData.avatar = avatar
    if (website !== undefined) updateData.website = website
    if (twitter !== undefined) updateData.twitter = twitter
    if (instagram !== undefined) updateData.instagram = instagram
    if (facebook !== undefined) updateData.facebook = facebook
    if (linkedin !== undefined) updateData.linkedin = linkedin
    if (phone !== undefined) updateData.phone = phone
    if (gender !== undefined) updateData.gender = gender
    if (birthday !== undefined) updateData.birthday = birthday ? new Date(birthday) : null
    if (emailVisible !== undefined) updateData.emailVisible = emailVisible
    if (phoneVisible !== undefined) updateData.phoneVisible = phoneVisible
    if (birthdayVisible !== undefined) updateData.birthdayVisible = birthdayVisible
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate
    if (interests !== undefined) updateData.interests = JSON.stringify(interests)

    if (username !== undefined && username.trim() !== '') {
      const existingUser = await prisma.user.findUnique({
        where: { username: username.trim() }
      })
      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
      }
      updateData.username = username.trim()
    }

    if (profileSlug !== undefined && profileSlug.trim() !== '') {
      const slug = profileSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
      const existingSlug = await prisma.user.findUnique({
        where: { profileSlug: slug }
      })
      if (existingSlug && existingSlug.id !== session.user.id) {
        return NextResponse.json({ error: 'Profile link already taken' }, { status: 400 })
      }
      updateData.profileSlug = slug
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      include: {
        _count: {
          select: {
            authoredBooks: true,
            purchases: true,
            reviews: true
          }
        }
      }
    })

    // Create Activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: 'PROFILE_UPDATED',
        message: 'updated their profile information.'
      }
    })

    return NextResponse.json({
      id: user.id,
      username: user.username,
      name: user.username,
      bio: user.bio || '',
      avatar: user.avatar || '/api/placeholder/150/150',
      phone: user.phone || '',
      gender: user.gender || '',
      birthday: user.birthday,
      emailVisible: user.emailVisible,
      phoneVisible: user.phoneVisible,
      birthdayVisible: user.birthdayVisible,
      isPrivate: user.isPrivate,
      isVerified: user.isVerified,
      profileSlug: user.profileSlug,
      level: 'Reader',
      joinDate: user.createdAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      booksRead: user._count.purchases,
      postsCount: 0,
      likesReceived: 0
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Cancel subscription if exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (user?.stripeSubscriptionId && user?.subscriptionStatus === 'ACTIVE') {
      try {
        const { stripe } = await import('@/lib/stripe')
        await stripe.subscriptions.cancel(user.stripeSubscriptionId)
      } catch (error) {
        console.error('Error canceling Stripe subscription:', error)
      }
    }

    // Delete user account
    await prisma.user.delete({
      where: { id: session.user.id }
    })

    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

