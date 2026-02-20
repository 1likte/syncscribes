const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning up old content...');

    // Order matters due to foreign keys if cascade isn't full
    await prisma.like.deleteMany({});
    await prisma.dislike.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.savedPost.deleteMany({});
    await prisma.activity.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.post.deleteMany({});

    console.log('Cleanup successful! All posts and interactions have been cleared.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
