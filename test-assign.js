const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const order = await prisma.order.findFirst();
  const rider = await prisma.rider.findFirst();
  if (!order || !rider) { console.log("Missing data"); return; }

  console.log("Before:", order.id, order.riderId, order.status);

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { riderId: rider.id, status: 'assigned' }
  });

  console.log("After:", updated.id, updated.riderId, updated.status);
}
main().catch(console.error).finally(() => prisma.$disconnect());
