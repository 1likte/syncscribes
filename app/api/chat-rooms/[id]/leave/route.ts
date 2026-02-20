import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST leave a room
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
            select: { id: true, ownerId: true }
        });

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        if (room.ownerId === session.user.id) {
            return NextResponse.json({ error: 'Room owner cannot leave the room' }, { status: 400 });
        }

        // Remove user from room
        await prisma.chatRoomMember.deleteMany({
            where: {
                roomId: room.id,
                userId: session.user.id
            }
        });

        return NextResponse.json({ message: 'Left room successfully' });
    } catch (error) {
        console.error('Failed to leave room:', error);
        return NextResponse.json({ error: 'Failed to leave room' }, { status: 500 });
    }
}
