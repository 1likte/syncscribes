import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)
        // Check if requester is Admin or Owner
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const userId = params.id
        const body = await req.json()
        const { banDurationDays, reason } = body

        // Calculate unban date
        const bannedUntil = new Date()
        bannedUntil.setDate(bannedUntil.getDate() + (banDurationDays || 36500)) // Default to ~100 years if permanent

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                bannedUntil: bannedUntil,
                banReason: reason || 'Violation of terms'
            }
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error('[USER_BAN]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const userId = params.id

        // Unban
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                bannedUntil: null,
                banReason: null
            }
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error('[USER_UNBAN]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
