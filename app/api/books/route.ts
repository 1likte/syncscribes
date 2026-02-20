import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')

    const books = await prisma.book.findMany({
      where: {
        status: 'PUBLISHED',
        OR: search ? [
          { title: { contains: search } },
          { description: { contains: search } },
        ] : undefined
      },
      include: {
        author: {
          select: {
            username: true,
            firstName: true,
            lastName: true
          }
        },
        category: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(books)
  } catch (error) {
    console.error('[BOOKS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { title, description, categoryId, coverImage, fileUrl, status } = body
    const categoryName = categoryId || 'Uncategorized'

    const authorId = session.user.id

    const book = await prisma.book.create({
      data: {
        title,
        description,
        coverImage,
        fileUrl,
        status: status || 'PUBLISHED',
        author: {
          connect: {
            id: authorId
          }
        },
        category: {
          connectOrCreate: {
            where: { name: categoryName },
            create: { name: categoryName }
          }
        }
      }
    })

    // Create activity record
    await prisma.activity.create({
      data: {
        userId: authorId,
        type: 'BOOK_ADDED',
        message: `yeni bir kitap ekledi: "${title}"`,
        metadata: JSON.stringify({ bookId: book.id, title: title })
      }
    })

    revalidatePath('/admin/books')
    revalidatePath('/browse')

    return NextResponse.json(book)
  } catch (error: any) {
    console.error('[BOOKS_POST]', error)
    return NextResponse.json(
      { message: error.message || 'Internal Error', error: error.toString() },
      { status: 500 }
    )
  }
}
