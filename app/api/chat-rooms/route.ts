import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET all chat rooms
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        const rooms = await prisma.chatRoom.findMany({
            include: {
                owner: {
                    select: {
                        username: true,
                        avatar: true
                    }
                },
                members: userId ? {
                    where: {
                        userId: userId
                    },
                    select: {
                        userId: true
                    }
                } : false,
                _count: {
                    select: {
                        members: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Add isMember flag
        const roomsWithMemberStatus = rooms.map(room => ({
            ...room,
            isMember: userId ? room.members.some((m: any) => m.userId === userId) : false,
            members: undefined // Remove members array from response
        }));

        return NextResponse.json(roomsWithMemberStatus);
    } catch (error) {
        console.error('Failed to fetch chat rooms:', error);
        return NextResponse.json({ error: 'Failed to fetch chat rooms' }, { status: 500 });
    }
}

// Helper function to create slugs
// Helper function to create slugs that handle Turkish characters
function slugify(text: string) {
    const charMap: { [key: string]: string } = {
        'ç': 'c', 'Ç': 'c',
        'ğ': 'g', 'Ğ': 'g',
        'ı': 'i', 'İ': 'i',
        'ö': 'o', 'Ö': 'o',
        'ş': 's', 'Ş': 's',
        'ü': 'u', 'Ü': 'u'
    };

    let str = text.toString();
    Object.keys(charMap).forEach(char => {
        str = str.replace(new RegExp(char, 'g'), charMap[char]);
    });

    return str
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '') || `room-${Math.random().toString(36).substring(2, 7)}`;
}

// POST create new chat room
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, description, isPublic, maxMembers, color } = await req.json();

        if (!name) {
            return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
        }

        // Get actual user from DB to avoid session ID mismatches (especially for emergency login)
        const currentUser = await prisma.user.findUnique({
            where: { username: session.user.username }
        });

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
        }

        const effectiveUserId = currentUser.id;

        // Generate slug from name
        const slug = slugify(name);

        // Check if slug or name is already taken
        const existingRoom = await prisma.chatRoom.findFirst({
            where: {
                OR: [
                    { slug },
                    { name: { equals: name } }
                ]
            }
        });

        if (existingRoom) {
            return NextResponse.json({ error: 'This room name is already taken. Please choose another one.' }, { status: 400 });
        }

        // Generate unique invite code
        const inviteCode = `${Math.random().toString(36).substring(2, 8)}-${Date.now().toString(36)}`.toUpperCase();

        // 1. Create room
        const room = await prisma.chatRoom.create({
            data: {
                name,
                slug,
                description,
                isPublic: isPublic ?? true,
                maxMembers: maxMembers || 100,
                color: color || 'emerald',
                inviteCode,
                ownerId: effectiveUserId
            }
        });

        // 2. Add owner as member
        await prisma.chatRoomMember.create({
            data: {
                userId: effectiveUserId,
                roomId: room.id,
                role: 'OWNER'
            }
        });

        // 3. Generate referral code for user if needed
        if (!currentUser.referralCode) {
            const referralCode = `REF-${session.user.username}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase();
            await prisma.user.update({
                where: { id: effectiveUserId },
                data: { referralCode }
            });
        }

        // 4. Fetch complete room to return
        const completeRoom = await prisma.chatRoom.findUnique({
            where: { id: room.id },
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

        return NextResponse.json(completeRoom);

    } catch (error) {
        console.error('Failed to create chat room:', error);
        return NextResponse.json({ error: `Failed to create chat room: ${(error as Error).message}` }, { status: 500 });
    }
}
