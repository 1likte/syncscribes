import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- POSTS ---');
    const posts = await prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
                select: { username: true }
            }
        }
    });

    console.log(`Total posts: ${posts.length}`);
    posts.forEach(post => {
        console.log(`[${post.createdAt.toISOString()}] ${post.author.username}: ${post.content.substring(0, 50)}...`);
    });

    console.log('\n--- ACTIVITIES ---');
    const activities = await prisma.activity.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: true
        }
    });

    console.log(`Total activities: ${activities.length}`);
    activities.forEach(activity => {
        console.log(`[${activity.createdAt.toISOString()}] ${activity.user.username}: ${activity.message}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
