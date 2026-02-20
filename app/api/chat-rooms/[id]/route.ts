import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET single chat room
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const room = await prisma.chatRoom.findFirst({
            where: {
                OR: [
                    { id: params.id },
                    { slug: params.id }
                ]
            },
            include: {
                owner: {
                    select: {
                        username: true,
                        avatar: true
                    }
                },
                members: {
                    include: {
                        user: {
                            select: {
                                username: true,
                                avatar: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        members: true
                    }
                }
            }
        });

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        return NextResponse.json(room);
    } catch (error) {
        console.error('Failed to fetch chat room:', error);
        return NextResponse.json({ error: 'Failed to fetch chat room' }, { status: 500 });
    }
}

// DELETE chat room (Owner only)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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

        // Only owner or admin can delete
        const isOwner = room.ownerId === session.user.id;
        // @ts-ignore
        const isAdmin = session.user.role === 'ADMIN';

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: 'Only the room owner can delete this room' }, { status: 403 });
        }

        await prisma.chatRoom.delete({
            where: { id: room.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete chat room:', error);
        return NextResponse.json({ error: 'Failed to delete chat room' }, { status: 500 });
    }
}
