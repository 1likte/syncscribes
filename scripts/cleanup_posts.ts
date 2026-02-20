import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning up database...');

    // Delete all Activities
    const deletedActivities = await prisma.activity.deleteMany({});
    console.log(`Deleted ${deletedActivities.count} activities.`);

    // Delete all Posts
    const deletedPosts = await prisma.post.deleteMany({});
    console.log(`Deleted ${deletedPosts.count} posts.`);

    // Delete all Notifications
    const deletedNotifications = await prisma.notification.deleteMany({});
    console.log(`Deleted ${deletedNotifications.count} notifications.`);


    console.log('Cleanup complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
