import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash('Antalya1250.', 10)

    const user = await prisma.user.upsert({
        where: { username: 'chefyunuskalkan' },
        update: {
            role: 'OWNER',
            password: password,
            email: 'chefyunuskalkan@example.com', // Placeholder email
            subscriptionStatus: 'ACTIVE',
            firstName: 'Chef',
            lastName: 'Yunus'
        },
        create: {
            username: 'chefyunuskalkan',
            email: 'chefyunuskalkan@example.com',
            password: password,
            role: 'OWNER',
            firstName: 'Chef',
            lastName: 'Yunus',
            subscriptionStatus: 'ACTIVE'
        },
    })

    console.log({ user })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
