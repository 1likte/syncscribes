const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    const user = await prisma.user.findUnique({
        where: { username: 'chefyunuskalkan' }
    });
    console.log('User ID:', user ? user.id : 'NOT FOUND');
    process.exit();
}

checkUser();
