const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { username: 'chefyunuskalkan' },
                { email: 'chefyunuskalkan@example.com' }
            ]
        }
    })

    // Hash the password
    const hashedPassword = await bcrypt.hash('Antalya1250.', 10)
    console.log('🔐 Password hashed successfully')

    let user;
    if (existingUser) {
        console.log('🔄 Updating existing user...')
        user = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                username: 'chefyunuskalkan',
                password: hashedPassword,
                role: 'ADMIN',
                subscriptionStatus: 'ACTIVE',
                subscriptionEndsAt: new Date('2026-12-31'),
                email: 'chefyunuskalkan@example.com',
                firstName: 'Chef',
                lastName: 'Yunus Kalkan',
                xp: 1000,
                level: 5,
            }
        })
    } else {
        console.log('✨ Creating new admin user...')
        user = await prisma.user.create({
            data: {
                username: 'chefyunuskalkan',
                password: hashedPassword,
                role: 'ADMIN',
                subscriptionStatus: 'ACTIVE',
                subscriptionEndsAt: new Date('2026-12-31'),
                email: 'chefyunuskalkan@example.com',
                firstName: 'Chef',
                lastName: 'Yunus Kalkan',
                xp: 1000,
                level: 5,
            }
        })
    }

    console.log('\n✅ Admin user created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 Giriş Bilgileri:')
    console.log('   Kullanıcı Adı: chefyunuskalkan')
    console.log('   Şifre: Antalya1250.')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('   Role:', user.role)
    console.log('   Subscription:', user.subscriptionStatus)
    console.log('   User ID:', user.id)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
    .catch((e) => {
        console.error('❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
