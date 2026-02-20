import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w-]+/g, '')   // Remove all non-word chars
        .replace(/--+/g, '-');    // Replace multiple - with single -
}

async function main() {
    console.log('Updating chat room slugs...');
    const rooms = await prisma.chatRoom.findMany({
        where: { slug: null }
    });

    for (const room of rooms) {
        let slug = slugify(room.name);
        // Check for duplicates
        let existing = await prisma.chatRoom.findUnique({ where: { slug } });
        let counter = 1;
        while (existing) {
            slug = `${slugify(room.name)}-${counter}`;
            existing = await prisma.chatRoom.findUnique({ where: { slug } });
            counter++;
        }

        await prisma.chatRoom.update({
            where: { id: room.id },
            data: { slug }
        });
        console.log(`Updated room "${room.name}" with slug "${slug}"`);
    }
    console.log('Done.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
