import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET messages for a room
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        // Resolve roomId from ID or Slug
        const room = await prisma.chatRoom.findFirst({
            where: {
                OR: [
                    { id: params.id },
                    { slug: params.id }
                ]
            }
        });

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        const messages = await prisma.chatRoomMessage.findMany({
            where: { roomId: room.id },
            orderBy: { createdAt: 'asc' },
            take: 100, // Last 100 messages
            include: {
                sender: { // Need sender info for display
                    select: {
                        username: true,
                        avatar: true
                    }
                }
            }
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Failed to fetch messages:', error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

// POST new message
export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content } = await req.json();

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        // Resolve roomId from ID or Slug
        const room = await prisma.chatRoom.findFirst({
            where: {
                OR: [
                    { id: params.id },
                    { slug: params.id }
                ]
            }
        });

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        // Check if user is a member of the room
        const membership = await prisma.chatRoomMember.findFirst({
            where: {
                roomId: room.id,
                userId: session.user.id
            }
        });

        if (!membership) {
            return NextResponse.json({ error: 'You must be a member to send messages' }, { status: 403 });
        }

        const message = await prisma.chatRoomMessage.create({
            data: {
                content,
                roomId: room.id,
                senderId: session.user.id
            }
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error('Failed to create message:', error);
        return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
    }
}
