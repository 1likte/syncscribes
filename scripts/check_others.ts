import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const reviews = await prisma.review.count();
    console.log(`Reviews: ${reviews}`);

    const books = await prisma.book.count();
    console.log(`Books: ${books}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
