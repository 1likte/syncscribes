const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findUnique({
            where: { username: 'chefyunuskalkan' }
        });

        if (!user) {
            console.log('User chefyunuskalkan not found.');
            return;
        }

        const deleteResult = await prisma.post.deleteMany({
            where: { authorId: user.id }
        });

        console.log(`Deleted ${deleteResult.count} posts by chefyunuskalkan.`);
    } catch (e) {
        console.error('Error deleting posts:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
