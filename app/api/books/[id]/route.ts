import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const book = await prisma.book.findUnique({
            where: { id: params.id },
            include: {
                author: {
                    select: { username: true }
                },
                category: true
            }
        })

        if (!book) {
            return NextResponse.json({ message: 'Book not found' }, { status: 404 })
        }

        return NextResponse.json(book)
    } catch (error) {
        console.error('[BOOK_GET]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Increment read count
        await prisma.book.update({
            where: { id: params.id },
            data: {
                reads: { increment: 1 }
            }
        })
        return NextResponse.json({ message: 'OK' }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 })
        }

        // Only allow owner or the author to delete
        const book = await prisma.book.findUnique({
            where: { id: params.id }
        })

        if (!book) {
            return NextResponse.json({ message: 'Book not found' }, { status: 404 })
        }

        if (session.user.role !== 'OWNER' && session.user.role !== 'ADMIN' && book.authorId !== session.user.id) {
            return NextResponse.json({ message: 'Unauthorized action' }, { status: 401 })
        }

        await prisma.book.delete({
            where: { id: params.id }
        })

        revalidatePath('/admin/books')
        revalidatePath('/browse')

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('[BOOK_DELETE]', error)
        return NextResponse.json({ message: 'Server error' }, { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 })
        }

        const body = await req.json()
        const { title, description, categoryId, coverImage, fileUrl, status } = body

        const book = await prisma.book.findUnique({
            where: { id: params.id }
        })

        if (!book) {
            return NextResponse.json({ message: 'Book not found' }, { status: 404 })
        }

        if (session.user.role !== 'OWNER' && session.user.role !== 'ADMIN' && book.authorId !== session.user.id) {
            return NextResponse.json({ message: 'Unauthorized action' }, { status: 401 })
        }

        const updatedBook = await prisma.book.update({
            where: { id: params.id },
            data: {
                title,
                description,
                coverImage,
                fileUrl,
                status,
                category: categoryId ? {
                    connectOrCreate: {
                        where: { name: categoryId },
                        create: { name: categoryId }
                    }
                } : undefined
            }
        })

        revalidatePath('/admin/books')
        revalidatePath('/browse')

        return NextResponse.json(updatedBook)
    } catch (error: any) {
        console.error('[BOOK_PATCH]', error)
        return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 })
    }
}
