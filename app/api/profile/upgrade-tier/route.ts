import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const TIERS = {
    SILVER: { name: 'Silver', color: '#C0C0C0', price: 0.25 },
    GOLD: { name: 'Gold', color: '#FFD700', price: 0.25 },
    EMERALD: { name: 'Emerald', color: '#50C878', price: 0.25 },
    PLATINUM: { name: 'Platinum', color: '#E5E4E2', price: 0.25 },
    DIAMOND: { name: 'Diamond', color: '#B9F2FF', price: 0.25 }
};

const NEXT_TIER: Record<string, keyof typeof TIERS | 'MAX'> = {
    'NONE': 'SILVER',
    'SILVER': 'GOLD',
    'GOLD': 'EMERALD',
    'EMERALD': 'PLATINUM',
    'PLATINUM': 'DIAMOND',
    'DIAMOND': 'MAX'
};

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { verifiedTier: true, xp: true, level: true }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const currentTier = user.verifiedTier || 'NONE';
        const nextTier = NEXT_TIER[currentTier as keyof typeof NEXT_TIER];

        if (nextTier === 'MAX') {
            return NextResponse.json({ error: 'You have reached the maximum level!' }, { status: 400 });
        }

        // In a real app, you would create a Stripe Checkout Session here.
        // Since we want to implement the "0.25 cent" logic simulation:
        // We will simulate a successful payment for now.

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                verifiedTier: nextTier,
                isVerified: true // Buying any tier makes you verified
            }
        });

        // Create Notification
        await prisma.notification.create({
            data: {
                userId: session.user.id,
                type: 'TIER_UPGRADE',
                message: `Congratulations! You've been upgraded to the ${TIERS[nextTier as keyof typeof TIERS].name} badge. 💎`,
                link: '/profile'
            }
        });

        return NextResponse.json({
            success: true,
            newTier: nextTier,
            tierName: TIERS[nextTier as keyof typeof TIERS].name
        });
    } catch (error) {
        console.error('Tier upgrade error:', error);
        return NextResponse.json({ error: 'Upgrade failed' }, { status: 500 });
    }
}
