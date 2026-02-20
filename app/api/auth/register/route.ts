import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
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
      subscriptionId,
      stripeSessionId
    } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if this is admin credentials trying to register as regular user
    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD
    const isAdminCredentials = adminUsername && adminPassword &&
      username === adminUsername &&
      password === adminPassword

    // If admin credentials, allow registration without payment check
    // Otherwise, require payment
    if (!isAdminCredentials && !subscriptionId && !stripeSessionId) {
      return NextResponse.json(
        { error: 'Payment required to register. Please complete payment first.' },
        { status: 402 }
      )
    }

    // Check if user already exists (unless it's admin credentials for regular user account)
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    // If admin credentials, allow creating a USER role account even if OWNER exists
    if (existingUser) {
      if (isAdminCredentials && existingUser.role === 'OWNER') {
        // Admin can create a separate USER account with same credentials
        // But check if USER account already exists
        const existingUserAccount = await prisma.user.findFirst({
          where: {
            username: username + '_user',
            role: 'USER'
          }
        })

        if (existingUserAccount) {
          return NextResponse.json(
            { error: 'User account already exists. Please sign in instead.' },
            { status: 400 }
          )
        }

        // Create USER account with modified username to avoid conflict
        const passwordHash = await bcrypt.hash(password, 10)
        let subscriptionData = {}
        if (subscriptionId || stripeSessionId) {
          const periodEnd = new Date()
          periodEnd.setMonth(periodEnd.getMonth() + 1)
          subscriptionData = {
            stripeSubscriptionId: subscriptionId || stripeSessionId,
            subscriptionStatus: 'ACTIVE',
            subscriptionEndsAt: periodEnd
          }
        }

        const user = await prisma.user.create({
          data: {
            username: username + '_user',
            password: passwordHash,
            role: 'USER',
            firstName: firstName || null,
            lastName: lastName || null,
            email: email || null,
            bio: bio || null,
            avatar: avatar || null,
            ...subscriptionData
          }
        })

        return NextResponse.json(
          { message: 'User created successfully', userId: user.id },
          { status: 201 }
        )
      } else {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 400 }
        )
      }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    let subscriptionData = {}
    if (subscriptionId || stripeSessionId) {
      const periodEnd = new Date()
      periodEnd.setMonth(periodEnd.getMonth() + 1)
      subscriptionData = {
        stripeSubscriptionId: subscriptionId || stripeSessionId,
        subscriptionStatus: 'ACTIVE',
        subscriptionEndsAt: periodEnd
      }
    }

    const user = await prisma.user.create({
      data: {
        username,
        password: passwordHash,
        role: 'USER',
        firstName: firstName || null,
        lastName: lastName || null,
        email: email || null,
        bio: bio || null,
        avatar: avatar || null,
        ...subscriptionData
      }
    })

    return NextResponse.json(
      { message: 'User created successfully', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Registration error:', error)
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
