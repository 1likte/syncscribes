import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST join a room
export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Resolve room from ID or Slug
        const room = await prisma.chatRoom.findFirst({
            where: {
                OR: [
                    { id: params.id },
                    { slug: params.id }
                ]
            },
            include: {
                _count: {
                    select: { members: true }
                }
            }
        });

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        // Check if room is full
        if (room._count.members >= room.maxMembers) {
            return NextResponse.json({ error: 'Room is full' }, { status: 400 });
        }

        // Check if already a member
        const existingMember = await prisma.chatRoomMember.findFirst({
            where: {
                roomId: room.id,
                userId: session.user.id
            }
        });

        if (existingMember) {
            return NextResponse.json({ message: 'Already a member' });
        }

        // Add user as member
        await prisma.chatRoomMember.create({
            data: {
                roomId: room.id,
                userId: session.user.id,
                role: 'MEMBER'
            }
        });

        // Check if owner reached 1000 members (using the room object directly since we have the latest count from initial fetch + 1)
        if (room._count.members + 1 >= 1000) {
            // Grant free access to room owner
            await prisma.user.update({
                where: { id: room.ownerId },
                data: { freeAccessGranted: true }
            });

            // Create notification for owner
            await prisma.notification.create({
                data: {
                    userId: room.ownerId,
                    type: 'FREE_ACCESS_UNLOCKED',
                    message: `🎉 Congratulations! Your room ${room.name} has reached 1000 members. You have unlocked free access to the site!`,
                    link: '/chat-rooms/' + (room.slug || room.id)
                }
            });
        }

        return NextResponse.json({ message: 'Joined successfully' });
    } catch (error) {
        console.error('Failed to join room:', error);
        return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
    }
}
