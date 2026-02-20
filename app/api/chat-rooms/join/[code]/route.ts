import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET room by invite code
export async function GET(req: Request, { params }: { params: { code: string } }) {
    try {
        const room = await prisma.chatRoom.findUnique({
            where: { inviteCode: params.code },
            include: {
                owner: {
                    select: {
                        username: true,
                        avatar: true
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
            return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
        }

        return NextResponse.json(room);
    } catch (error) {
        console.error('Failed to fetch room by code:', error);
        return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
    }
}
