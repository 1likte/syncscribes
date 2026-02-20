import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    req: Request,
    { params }: { params: { id: string, messageId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const message = await prisma.chatRoomMessage.findUnique({
            where: { id: params.messageId },
            include: { room: true }
        });

        if (!message) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        // Check permission: Owner of message OR Owner of room OR Admin
        const isMessageOwner = message.senderId === session.user.id;
        const isRoomOwner = message.room.ownerId === session.user.id;
        const isAdmin = session.user.role === 'ADMIN';

        if (!isMessageOwner && !isRoomOwner && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.chatRoomMessage.delete({
            where: { id: params.messageId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete message:', error);
        return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
    }
}
