import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const { recipientId, content } = await req.json();

        if (!recipientId || !content) {
            return new NextResponse("Missing data", { status: 400 });
        }

        const message = await prisma.message.create({
            data: {
                content,
                senderId: session.user.id,
                receiverId: recipientId,
            },
            include: {
                sender: { select: { username: true, avatar: true } },
            }
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error("[MESSAGES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const { searchParams } = new URL(req.url);
        const recipientId = searchParams.get("recipientId");

        if (recipientId) {
            const messages = await prisma.message.findMany({
                where: {
                    OR: [
                        { senderId: session.user.id, receiverId: recipientId },
                        { senderId: recipientId, receiverId: session.user.id }
                    ]
                },
                orderBy: { createdAt: "asc" },
                include: {
                    sender: { select: { username: true, avatar: true } },
                    receiver: { select: { username: true, avatar: true } }
                }
            });
            return NextResponse.json(messages);
        }

        // Fetch contacts (conversations)
        const conversations = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: session.user.id },
                    { receiverId: session.user.id }
                ]
            },
            distinct: ['senderId', 'receiverId'],
            orderBy: { createdAt: 'desc' },
            include: {
                sender: { select: { id: true, username: true, avatar: true } },
                receiver: { select: { id: true, username: true, avatar: true } }
            }
        });

        return NextResponse.json(conversations);
    } catch (error) {
        console.error("[MESSAGES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
