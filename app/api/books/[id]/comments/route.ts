import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const comments = await prisma.bookComment.findMany({
            where: { bookId: params.id },
            include: {
                user: {
                    select: {
                        username: true,
                        avatar: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error("[BOOK_COMMENTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { content } = await req.json();

        if (!content) {
            return new NextResponse("Content is required", { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { username: session.user.username }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const comment = await prisma.bookComment.create({
            data: {
                content,
                bookId: params.id,
                userId: user.id
            },
            include: {
                user: {
                    select: {
                        username: true,
                        avatar: true,
                    }
                }
            }
        });

        return NextResponse.json(comment);
    } catch (error) {
        console.error("[BOOK_COMMENTS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
