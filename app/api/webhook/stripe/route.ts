import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const subscription = await stripe.subscriptions.retrieve(
                session.subscription as string
            );

            // Handle Registration Flow (New User)
            if (session.metadata?.registrationFlow === 'true') {
                const { username, password, firstName, lastName, email, phone, bio, avatar } = session.metadata;

                const bcrypt = require('bcryptjs');
                const hashedPassword = await bcrypt.hash(password, 10);

                await prisma.user.create({
                    data: {
                        username,
                        password: hashedPassword,
                        firstName,
                        lastName,
                        email,
                        phone,
                        bio,
                        avatar,
                        stripeSubscriptionId: subscription.id,
                        stripeCustomerId: subscription.customer as string,
                        subscriptionStatus: 'ACTIVE',
                        subscriptionPriceId: subscription.items.data[0].price.id,
                        subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
                        isVerified: false,
                        verifiedTier: 'NONE',
                        role: 'USER'
                    }
                });
            }
            // Handle Upgrade Flow (Existing User)
            else if (session?.metadata?.userId) {
                await prisma.user.update({
                    where: {
                        id: session.metadata.userId,
                    },
                    data: {
                        stripeSubscriptionId: subscription.id,
                        stripeCustomerId: subscription.customer as string,
                        subscriptionStatus: 'ACTIVE',
                        subscriptionPriceId: subscription.items.data[0].price.id,
                        subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
                    },
                });
            }
            break;
        }

        case 'invoice.payment_succeeded': {
            const subscription = await stripe.subscriptions.retrieve(
                session.subscription as string
            );

            await prisma.user.update({
                where: {
                    stripeSubscriptionId: subscription.id,
                },
                data: {
                    subscriptionStatus: 'ACTIVE',
                    subscriptionPriceId: subscription.items.data[0].price.id,
                    subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
                },
            });
            break;
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            await prisma.user.update({
                where: {
                    stripeSubscriptionId: subscription.id,
                },
                data: {
                    subscriptionStatus: 'INACTIVE',
                    subscriptionEndsAt: new Date(),
                },
            });
            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return new NextResponse(null, { status: 200 });
}
