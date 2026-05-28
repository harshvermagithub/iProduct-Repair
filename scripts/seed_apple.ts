import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Starting Apple Seed...")

    const apple = await prisma.brand.upsert({
        where: { id: "apple" },
        update: {
            categories: ["smartphone", "laptop", "tablet", "smartwatch", "repair"]
        },
        create: {
            id: "apple",
            name: "Apple",
            logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
            categories: ["smartphone", "laptop", "tablet", "smartwatch", "repair"],
            priority: 1
        }
    })

    // MacBooks (Category: laptop)
    const macbooks = [
        { name: "MacBook Pro 16-inch (M3 Max)", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
        { name: "MacBook Pro 14-inch (M3 Pro)", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
        { name: "MacBook Air 15-inch (M3)", img: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }
    ]

    for (const mb of macbooks) {
        const model = await prisma.model.create({
            data: {
                brandId: apple.id,
                name: mb.name,
                img: mb.img,
                category: "laptop",
                priority: 1
            }
        })
        await prisma.variant.create({
            data: {
                modelId: model.id,
                name: "Standard Repair",
                basePrice: 5000
            }
        })
    }

    // iPhones (Category: smartphone)
    const iphones = [
        { name: "iPhone 15 Pro Max", img: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
        { name: "iPhone 14 Pro", img: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }
    ]

    for (const ip of iphones) {
        const model = await prisma.model.create({
            data: {
                brandId: apple.id,
                name: ip.name,
                img: ip.img,
                category: "smartphone",
                priority: 1
            }
        })
        await prisma.variant.create({
            data: {
                modelId: model.id,
                name: "Standard Repair",
                basePrice: 3000
            }
        })
    }

    console.log("Seeded Apple devices.")
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
