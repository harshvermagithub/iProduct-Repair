import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = process.env.SUPERADMIN_EMAIL || 'admin@fonzkart.in'
    const password = process.env.SUPERADMIN_PASSWORD
    
    if (!password) {
        console.error('❌ Error: SUPERADMIN_PASSWORD environment variable is not set.')
        process.exit(1)
    }
    
    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.upsert({
        where: { email },
        update: { 
            role: 'SUPER_ADMIN',
            passwordHash
        },
        create: {
            email,
            name: 'Super Admin',
            passwordHash,
            role: 'SUPER_ADMIN'
        }
    })

    console.log(`\n✅ Super Admin setup successfully!`)
    console.log(`Email: ${user.email}`)
    console.log(`Role: ${user.role}`)
    console.log(`\nPlease login at /login with the password provided in environment variables.`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
