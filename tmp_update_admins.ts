import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const res = await prisma.user.updateMany({
        where: { role: 'ADMIN' },
        data: { role: 'SUPER_ADMIN' }
    });
    console.log(`Updated ${res.count} admins to SUPER_ADMIN.`);
    
    // Also log current users to see counts
    const users = await prisma.user.findMany({ select: { role: true } });
    const counts = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    console.log('Current roles:', counts);
}
main().finally(() => prisma.$disconnect());
