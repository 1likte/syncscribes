import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        // Fetch user progress, saved books, and liked books
        const collections = await prisma.readingProgress.findMany({
            where: {
                userId: session.user.id,
                OR: [
                    { page: { gt: 1 } },
                    // @ts-ignore
                    { isSaved: true },
                    // @ts-ignore
                    { isLiked: true }
                ]
            },
            include: {
                book: {
                    include: {
                        author: {
                            select: { username: true }
                        }
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        // Split into categories
        const statistics = {
            totalBooks: collections.length,
            savedCount: collections.filter((c: any) => c.isSaved).length,
            likedCount: collections.filter((c: any) => c.isLiked).length,
            readingCount: collections.filter((c: any) => c.page > 1).length,
        };

        return NextResponse.json({
            collections,
            statistics
        });
    } catch (error) {
        console.error("[COLLECTIONS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
