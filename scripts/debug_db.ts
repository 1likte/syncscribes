import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const models = ['post', 'activity', 'comment', 'notification', 'like', 'dislike'];

    for (const model of models) {
        // @ts-ignore
        const count = await prisma[model].count();
        console.log(`${model.toUpperCase()}: ${count}`);
        if (count > 0) {
            // @ts-ignore
            const items = await prisma[model].findMany({ take: 5, orderBy: { createdAt: 'desc' } });
            console.log(JSON.stringify(items, null, 2));
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
