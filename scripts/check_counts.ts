import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.count();
    console.log(`Users: ${users}`);

    const posts = await prisma.post.count();
    console.log(`Posts: ${posts}`);

    const activities = await prisma.activity.count();
    console.log(`Activities: ${activities}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
