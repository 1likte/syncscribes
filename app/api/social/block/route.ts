import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { targetId } = await request.json();
        if (!targetId || targetId === session.user.id) return NextResponse.json({ error: 'Invalid target' }, { status: 400 });

        // Create Block
        await prisma.block.create({
            data: {
                blockerId: session.user.id,
                blockedId: targetId
            }
        });

        // Remove any existing follow relationships
        await prisma.follow.deleteMany({
            where: {
                OR: [
                    { followerId: session.user.id, followingId: targetId },
                    { followerId: targetId, followingId: session.user.id }
                ]
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to block user' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { targetId } = await request.json();

        await prisma.block.delete({
            where: {
                blockerId_blockedId: {
                    blockerId: session.user.id,
                    blockedId: targetId
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to unblock user' }, { status: 500 });
    }
}
