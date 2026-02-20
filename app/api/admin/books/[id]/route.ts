import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !['ADMIN', 'OWNER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { status } = await req.json();
    const bookId = params.id;

    const book = await prisma.book.update({
      where: { id: bookId },
      data: { status }
    });

    return NextResponse.json(book);
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !['ADMIN', 'OWNER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const bookId = params.id;
    await prisma.book.delete({
      where: { id: bookId }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Book deletion error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const bookId = params.id;
    const currentBook = await prisma.book.findUnique({ where: { id: bookId } });

    if (!currentBook) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    let coverPath = currentBook.coverImage;
    if (coverFile && coverFile.size > 0) {
      const bytes = await coverFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${coverFile.name.replace(/\s+/g, '_')}`;
      coverPath = `/uploads/covers/${fileName}`;
      await writeFile(path.join(process.cwd(), 'public', 'uploads', 'covers', fileName), buffer);
    }

    let filePath = currentBook.fileUrl;
    if (pdfFile && pdfFile.size > 0) {
      const bytes = await pdfFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${pdfFile.name.replace(/\s+/g, '_')}`;
      filePath = `/uploads/books/${fileName}`;
      await writeFile(path.join(process.cwd(), 'public', 'uploads', 'books', fileName), buffer);
    }

    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: {
        title: title || currentBook.title,
        description: description || currentBook.description,
        category: categoryId ? {
          connect: { id: categoryId }
        } : undefined,
        coverImage: coverPath,
        fileUrl: filePath,
      }
    });

    return NextResponse.json(updatedBook);
  } catch (err) {
    console.error('Book update error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}