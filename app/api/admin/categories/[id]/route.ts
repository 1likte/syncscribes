import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'OWNER'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const categoryId = params.id;

        // Optional: Check if there are books in this category and handle them
        // For now, we'll just set their categoryId to null (handled by Prisma if onDelete: SetNull, 
        // but we use default which is Restrict usually, so let's check)

        await prisma.category.delete({
            where: { id: categoryId }
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Category deletion error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
