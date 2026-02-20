import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { targetId } = await request.json();
        if (!targetId || targetId === session.user.id) {
            return NextResponse.json({ error: 'Invalid target user' }, { status: 400 });
        }

        const targetUser = await prisma.user.findUnique({
            where: { id: targetId },
            select: { isPrivate: true, username: true }
        });

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: session.user.id,
                    followingId: targetId
                }
            }
        });

        if (existingFollow) {
            // Unfollow
            await prisma.follow.delete({
                where: { id: existingFollow.id }
            });
            return NextResponse.json({ followed: false });
        } else {
            // Follow
            const status = targetUser.isPrivate ? 'PENDING' : 'ACCEPTED';
            await prisma.follow.create({
                data: {
                    followerId: session.user.id,
                    followingId: targetId,
                    status
                }
            });

            // Create Notification
            await prisma.notification.create({
                data: {
                    userId: targetId,
                    type: status === 'PENDING' ? 'FOLLOW_REQUEST' : 'FOLLOW_ACCEPTED',
                    message: `${session.user.name} ${status === 'PENDING' ? 'wants to follow you' : 'started following you'}.`,
                    link: `/profile/${session.user.id}`
                }
            });

            return NextResponse.json({ followed: true, status });
        }
    } catch (error) {
        console.error('Error in follow toggle:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
