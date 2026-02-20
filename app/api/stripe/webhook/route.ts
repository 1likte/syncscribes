import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

async function getUserIdFromSubscription(subscriptionId: string): Promise<string | null> {
  try {
    const user = await prisma.user.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
      select: { id: true }
    })
    return user?.id || null
  } catch (error) {
    // Always log errors for webhooks (important for debugging)
    console.error('Error finding user from subscription:', error)
    return null
  }
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: any

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    // Always log webhook security errors
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object

        const bookId = session.metadata?.bookId
        const userId = session.metadata?.userId
        const registrationFlow = session.metadata?.registrationFlow === 'true'
        const username = session.metadata?.username
        const password = session.metadata?.password
        const firstName = session.metadata?.firstName || null
        const lastName = session.metadata?.lastName || null
        const email = session.metadata?.email || null
        const phone = session.metadata?.phone || null
        const bio = session.metadata?.bio || null
        const avatar = session.metadata?.avatar || null

        // Registration flow: create user and subscription
        if (registrationFlow && username && password && session.mode === 'subscription') {
          try {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
              where: { username }
            })

            let newUserId: string

            if (!existingUser) {
              // Hash password and create user
              const passwordHash = await bcrypt.hash(password, 10)

              // Check if this is admin credentials trying to create regular user account
              const adminUsername = process.env.ADMIN_USERNAME
              const adminPassword = process.env.ADMIN_PASSWORD
              const isAdminCredentials = adminUsername && adminPassword &&
                username === adminUsername &&
                password === adminPassword

              const user = await prisma.user.create({
                data: {
                  username: isAdminCredentials ? username + '_user' : username,
                  password: passwordHash,
                  role: 'USER',
                  firstName: firstName || null,
                  lastName: lastName || null,
                  email: email || null,
                  phone: phone || null,
                  bio: bio || null,
                  avatar: avatar || null
                }
              })

              newUserId = user.id

              if (process.env.NODE_ENV !== 'production') {
                console.log(`User created via registration flow: ${user.username}`)
              }
            } else {
              newUserId = existingUser.id
            }

            // Update user with subscription info
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

            await prisma.user.update({
              where: { id: newUserId },
              data: {
                stripeSubscriptionId: subscription.id,
                subscriptionStatus: 'ACTIVE',
                subscriptionEndsAt: new Date(subscription.current_period_end * 1000)
              }
            })

            if (process.env.NODE_ENV !== 'production') {
              console.log(`Subscription created for new user: ${newUserId}`)
            }
          } catch (error) {
            console.error('Error creating user in registration flow:', error)
            // Don't return error - let Stripe know webhook was received
          }
        } else if (bookId && userId) {
          // Regular book purchase
          await prisma.purchase.create({
            data: {
              userId: userId,
              bookId: bookId,
              amount: session.amount_total / 100
            }
          })

          // Log important business events (webhook processing should be logged)
          if (process.env.NODE_ENV !== 'production') {
            console.log(`Purchase completed: User ${userId} bought Book ${bookId}`)
          }
        } else if (userId && session.mode === 'subscription') {
          // Subscription created for existing user
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeSubscriptionId: subscription.id,
              subscriptionStatus: 'ACTIVE',
              subscriptionEndsAt: new Date(subscription.current_period_end * 1000)
            }
          })

          if (process.env.NODE_ENV !== 'production') {
            console.log(`Subscription created: User ${userId}`)
          }
        }
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object

        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const userId = invoice.metadata?.userId || await getUserIdFromSubscription(invoice.subscription as string)

          if (userId) {
            await prisma.user.update({
              where: { id: userId },
              data: {
                stripeSubscriptionId: subscription.id,
                subscriptionStatus: 'ACTIVE',
                subscriptionEndsAt: new Date(subscription.current_period_end * 1000)
              }
            })

            if (process.env.NODE_ENV !== 'production') {
              console.log(`Subscription renewed: User ${userId}`)
            }
          }
        }
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object

        await prisma.user.updateMany({
          where: { stripeSubscriptionId: deletedSubscription.id },
          data: {
            subscriptionStatus: 'CANCELED'
          }
        })

        if (process.env.NODE_ENV !== 'production') {
          console.log(`Subscription canceled: ${deletedSubscription.id}`)
        }
        break

      case 'checkout.session.expired':
        if (process.env.NODE_ENV !== 'production') {
          console.log('Checkout session expired')
        }
        break

      default:
        if (process.env.NODE_ENV !== 'production') {
          console.log(`Unhandled event type: ${event.type}`)
        }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    // Always log webhook processing errors
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
