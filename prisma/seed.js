const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const adminPassword = await bcrypt.hash('Antalya1250.', 10);

    // Create Owner
    const owner = await prisma.user.upsert({
        where: { username: 'chefyunuskalkan' },
        update: {},
        create: {
            username: 'chefyunuskalkan',
            email: 'chefyunuskalkan@gmail.com', // Placeholder email
            password: adminPassword,
            role: 'OWNER',
            firstName: 'Yunus',
            lastName: 'Kalkan',
            bio: 'System Owner',
            xp: 1000,
            level: 10,
        },
    });

    console.log('Seeded Owner:', owner.username);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
