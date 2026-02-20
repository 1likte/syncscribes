import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const savedPosts = await prisma.savedPost.findMany({
            where: { userId: session.user.id },
            include: {
                post: {
                    include: {
                        author: {
                            select: { username: true, avatar: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(savedPosts.map(sp => sp.post));
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch saved posts' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { postId } = await request.json();
        if (!postId) return NextResponse.json({ error: 'Post ID required' }, { status: 400 });

        const existingSave = await prisma.savedPost.findUnique({
            where: {
                userId_postId: {
                    userId: session.user.id,
                    postId
                }
            }
        });

        if (existingSave) {
            await prisma.savedPost.delete({ where: { id: existingSave.id } });
            return NextResponse.json({ saved: false });
        } else {
            await prisma.savedPost.create({
                data: {
                    userId: session.user.id,
                    postId
                }
            });

            // Award XP (2 points for saving)
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    xp: { increment: 2 }
                }
            });

            // Create Activity
            await prisma.activity.create({
                data: {
                    userId: session.user.id,
                    type: 'POST_SAVED',
                    message: 'added a post to their archive.',
                    metadata: JSON.stringify({ postId })
                }
            });

            return NextResponse.json({ saved: true });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to toggle save' }, { status: 500 });
    }
}
