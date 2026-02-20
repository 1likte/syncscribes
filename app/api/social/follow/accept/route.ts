import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { followerId, notificationId } = await request.json();

        // Update Follow Status
        await prisma.follow.update({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId: session.user.id
                }
            },
            data: { status: 'ACCEPTED' }
        });

        // Mark Notification as Read
        if (notificationId) {
            await prisma.notification.update({
                where: { id: notificationId },
                data: { isRead: true }
            });
        }

        // Notify Follower
        await prisma.notification.create({
            data: {
                userId: followerId,
                type: 'FOLLOW_ACCEPTED',
                message: `${session.user.name} accepted your follow request.`,
                link: `/profile/${session.user.id}`
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to accept follow' }, { status: 500 });
    }
}
