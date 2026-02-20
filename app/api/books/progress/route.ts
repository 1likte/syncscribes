import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const { bookId, page, isSaved, isLiked } = await req.json();

        if (!bookId) {
            return new NextResponse("Missing bookId", { status: 400 });
        }

        const updateData: any = {};
        if (page !== undefined) updateData.page = page;
        if (isSaved !== undefined) updateData.isSaved = isSaved;
        if (isLiked !== undefined) updateData.isLiked = isLiked;

        const progress = await prisma.readingProgress.upsert({
            where: {
                userId_bookId: {
                    userId: session.user.id,
                    bookId: bookId
                }
            },
            update: updateData,
            create: {
                userId: session.user.id,
                bookId: bookId,
                page: page || 1,
                // @ts-ignore
                isSaved: isSaved || false,
                // @ts-ignore
                isLiked: isLiked || false
            }
        });

        return NextResponse.json(progress);
    } catch (error) {
        console.error("[PROGRESS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const { searchParams } = new URL(req.url);
        const bookId = searchParams.get("bookId");

        if (!bookId) return new NextResponse("BookId required", { status: 400 });

        const progress = await prisma.readingProgress.findUnique({
            where: {
                userId_bookId: {
                    userId: session.user.id,
                    bookId: bookId
                }
            }
        });

        return NextResponse.json(progress || { page: 1 });
    } catch (error) {
        console.error("[PROGRESS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
