import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !['ADMIN', 'OWNER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const books = await prisma.book.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      author: {
        select: {
          username: true
        }
      },
      category: true
    }
  });

  return NextResponse.json(books);
}

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !['ADMIN', 'OWNER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string;
    const coverFile = formData.get('coverImage') as File;
    const pdfFile = formData.get('pdfFile') as File;

    if (!title || !categoryId) {
      return NextResponse.json({ error: 'Title and Category are required' }, { status: 400 });
    }

    // Paths
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const coversDir = path.join(uploadDir, 'covers');
    const booksDir = path.join(uploadDir, 'books');

    await mkdir(coversDir, { recursive: true });
    await mkdir(booksDir, { recursive: true });

    let coverPath = null;
    if (coverFile && coverFile.size > 0) {
      const bytes = await coverFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${coverFile.name.replace(/\s+/g, '_')}`;
      coverPath = `/uploads/covers/${fileName}`;
      await writeFile(path.join(process.cwd(), 'public', 'uploads', 'covers', fileName), buffer);
    }

    let filePath = null;
    if (pdfFile && pdfFile.size > 0) {
      const bytes = await pdfFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${pdfFile.name.replace(/\s+/g, '_')}`;
      filePath = `/uploads/books/${fileName}`;
      await writeFile(path.join(process.cwd(), 'public', 'uploads', 'books', fileName), buffer);
    }

    const book = await prisma.book.create({
      data: {
        title,
        description: description || '',
        category: categoryId ? {
          connect: { id: categoryId }
        } : undefined,
        coverImage: coverPath,
        fileUrl: filePath,
        tags: '[]',
        status: 'APPROVED',
        author: {
          connect: { id: session.user.id }
        }
      }
    });


    return NextResponse.json(book);
  } catch (err) {
    console.error('Book creation error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

