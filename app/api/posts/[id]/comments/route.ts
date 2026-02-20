import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET all comments for a post
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const postId = params.id;

        const comments = await prisma.comment.findMany({
            where: { postId, parentId: null },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        level: true,
                    }
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true,
                                level: true,
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error('Fetch comments error:', error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

// POST a new comment or reply
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const postId = params.id;
        const userId = session.user.id;
        const { content, parentId } = await req.json();

        if (!content?.trim()) {
            return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
        }

        // Create the comment
        const comment = await prisma.comment.create({
            data: {
                content,
                postId,
                userId,
                parentId: parentId || null
            },
            include: {
                user: {
                    select: {
                        username: true,
                        avatar: true,
                        level: true
                    }
                }
            }
        });

        // Award XP (3 points for commenting, 5 for reply)
        const xpAmount = parentId ? 5 : 3;
        await prisma.user.update({
            where: { id: userId },
            data: {
                xp: { increment: xpAmount }
            }
        });

        // Create Activity
        await prisma.activity.create({
            data: {
                userId,
                type: parentId ? 'COMMENT_REPLIED' : 'POST_COMMENTED',
                message: parentId ? 'replied to a comment.' : 'commented on a post.',
                metadata: JSON.stringify({ postId, commentId: comment.id, parentId })
            }
        });

        // If it's a reply, notify the parent comment's author
        if (parentId) {
            const parentComment = await prisma.comment.findUnique({
                where: { id: parentId },
                select: { userId: true }
            });

            if (parentComment && parentComment.userId !== userId) {
                await prisma.notification.create({
                    data: {
                        userId: parentComment.userId,
                        type: 'COMMENT_REPLY',
                        message: `${session.user.username || session.user.name} replied to your comment.`,
                        link: `/activity?post=${postId}`
                    }
                });
            }
        }

        return NextResponse.json(comment);
    } catch (error) {
        console.error('Post comment error:', error);
        return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
    }
}
