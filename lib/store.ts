import { prisma } from '@/lib/db';
import { Rider as PrismaRider, Brand as PrismaBrand, Model as PrismaModel, Variant as PrismaVariant, Order as PrismaOrder } from '@prisma/client';

// Re-export interfaces for app compatibility, though Prisma types are preferred
export interface User {
    id: string;
    email: string;
    phone?: string | null;
    passwordHash: string;
    name: string;
    role: string;
    resetToken?: string | null;
    resetTokenExpiry?: Date | null;
    pincodes?: string[];
    cityId?: string | null;
    managedCities?: any[];
}

export type Rider = PrismaRider;

export interface Order {
    id: string;
    orderNumber?: number;
    userId: string;
    user?: Partial<User> | null;
    device: string;
    price: number;
    date: string;
    status: string;
    address: string;
    pincode?: string | null;
    location: {
        lat: number;
        lng: number;
    } | null;
    riderId?: string | null;
    answers?: unknown;
    riderAnswers?: unknown;
    verificationImages?: string[];
    offeredPrice?: number | null;
}

export type Brand = PrismaBrand;
export type Model = PrismaModel;
export type Variant = PrismaVariant;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EvaluationRule = any;

export const db = {
    getUsers: async () => {
        return await prisma.user.findMany();
    },
    addUser: async (user: User) => {
        await prisma.user.create({
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                passwordHash: user.passwordHash,
                role: user.role
            }
        });
    },
    findUserByEmail: async (email: string) => {
        return await prisma.user.findFirst({ 
            where: { 
                email: { 
                    equals: email.trim().toLowerCase(), 
                    mode: 'insensitive' 
                } 
            } 
        });
    },
    findUserById: async (id: string) => {
        return await prisma.user.findUnique({ where: { id } });
    },
    updateUserRole: async (email: string, role: string) => {
        await prisma.user.update({
            where: { email },
            data: { role }
        });
    },
    updateUserPassword: async (email: string, passwordHash: string) => {
        await prisma.user.update({
            where: { email },
            data: { passwordHash }
        });
    },
    updateProfile: async (email: string, data: { name?: string, phone?: string }) => {
        return await prisma.user.update({
            where: { email },
            data
        });
    },
    setResetToken: async (email: string, token: string, expiry: Date) => {
        await prisma.user.update({
            where: { email },
            data: { resetToken: token, resetTokenExpiry: expiry }
        });
    },
    clearResetToken: async (email: string) => {
        await prisma.user.update({
            where: { email },
            data: { resetToken: null, resetTokenExpiry: null }
        });
    },
    getAdmins: async () => {
        return await prisma.user.findMany({ where: { role: 'ADMIN' } });
    },
    getOrders: async (userId: string) => {
        const orders = await prisma.order.findMany({
            where: { userId },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
        return orders.map(mapPrismaOrderToAppOrder);
    },
    getAllOrders: async () => {
        const orders = await prisma.order.findMany({
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
        return orders.map(mapPrismaOrderToAppOrder);
    },
    addOrder: async (order: Order) => {
        const newOrder = await prisma.order.create({
            data: {
                id: order.id,
                userId: order.userId,
                device: order.device,
                price: order.price,
                status: order.status,
                address: order.address,
                pincode: order.pincode,
                locationLat: order.location?.lat,
                locationLng: order.location?.lng,
                answers: order.answers ? JSON.stringify(order.answers) : null,
                createdAt: new Date(order.date),
            },
            include: {
                user: true
            }
        });

        // Broadcast Notifications
        try {
            // 1. Identify recipients
            // Admins & Super Admins (Always notify)
            const globalAdmins = await prisma.user.findMany({
                where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } }
            });

            // Targeted Zonal Heads (If order has pincode, find city, then find manager of that city)
            // For now, let's just find all Zonal Heads if we don't have a direct city link yet
            const zonalHeads = await prisma.user.findMany({
                where: { role: 'ZONAL_HEAD' }
            });

            // Partners (Specific to pincode or city)
            const targetedPartners = await prisma.user.findMany({
                where: {
                    role: 'PARTNER',
                    OR: [
                        { pincodes: { has: order.pincode || '' } },
                        // Fallback: If no pincodes defined for partner but they are in the same city (future use)
                    ]
                }
            });

            const allRecipients = [...globalAdmins, ...zonalHeads, ...targetedPartners];
            // Remove duplicates by email
            const uniqueRecipients = Array.from(new Map(allRecipients.map(r => [r.email, r])).values());

            // 2. Create System Notifications
            await Promise.all(uniqueRecipients.map(recipient => 
                prisma.notification.create({
                    data: {
                        userId: recipient.id,
                        title: 'New Order: Action Required',
                        message: `Order #${newOrder.orderNumber} for ${newOrder.device} placed in ${newOrder.pincode || 'unknown area'}.`,
                        type: 'order_new',
                        orderId: newOrder.id
                    }
                })
            ));

            // Also create a role-based broadcast for UI fallback
            await prisma.notification.create({
                data: {
                    role: 'ADMIN',
                    title: 'New Order Placed',
                    message: `New global order #${newOrder.orderNumber} needs assignment.`,
                    type: 'order_new',
                    orderId: newOrder.id
                }
            });

            // 3. Send Emails
            const { sendSystemEmail } = await import('@/lib/email');
            const emailHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 2px solid #10b981; border-radius: 15px;">
                    <h2 style="color: #10b981; font-size: 24px;">🚀 New Order Received!</h2>
                    <p style="font-size: 16px; color: #333;">Order <b>#${newOrder.orderNumber}</b> has been placed and requires your attention.</p>
                    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #d1fae5;">
                        <p style="margin: 5px 0;"><b>Device:</b> ${newOrder.device}</p>
                        <p style="margin: 5px 0;"><b>Estimated Offer:</b> ₹${newOrder.price}</p>
                        <p style="margin: 5px 0;"><b>Pincode:</b> ${newOrder.pincode || 'Not provided'}</p>
                        <p style="margin: 5px 0;"><b>Customer:</b> ${newOrder.user.name}</p>
                    </div>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">View in Dashboard</a>
                    <p style="color: #888; font-size: 12px; margin-top: 25px;">Fonzkart Logistics Management System</p>
                </div>
            `;

            // Sequential or concurrent sending? Concurrent for speed.
            Promise.all(uniqueRecipients.map(r => 
                sendSystemEmail(r.email, `New Order Alert: #${newOrder.orderNumber} (${newOrder.pincode})`, emailHtml)
            )).catch(err => console.error("Email broadcast partial failure:", err));

        } catch (e) {
            console.error("Critical Notification broadcast failed:", e);
        }
    },
    updateOrderRider: async (orderId: string, riderId: string) => {
        try {
            const updatedOrder = await prisma.order.update({
                where: { id: orderId },
                data: { riderId, status: 'assigned' }
            });

            // Notify Rider (Wrap in catch to avoid failing the whole transaction)
            try {
                await prisma.notification.create({
                    data: {
                        riderId: riderId,
                        title: 'New Task Assigned',
                        message: `You have been assigned order #${updatedOrder.orderNumber} for pickup.`,
                        type: 'order_assigned',
                        orderId: updatedOrder.id
                    }
                });
            } catch (e) {
                console.error("Delayed notification creation failed:", e);
            }
            
            return true;
        } catch (error) {
            console.error("Order Rider Update/Notify Failed:", error);
            return false;
        }
    },
    updateOrderStatus: async (orderId: string, status: string) => {
        try {
            await prisma.order.update({
                where: { id: orderId },
                data: { status }
            });
            return true;
        } catch {
            return false;
        }
    },

    // Rider Methods
    getRiders: async () => {
        return await prisma.rider.findMany();
    },
    addRider: async (rider: { id: string, name: string, phone: string, status?: string, password?: string | null, partnerId?: string | null }) => {
        await prisma.rider.create({
            data: {
                id: rider.id,
                name: rider.name,
                phone: rider.phone,
                status: rider.status || 'available',
                password: rider.password,
                // @ts-ignore
                partnerId: rider.partnerId
            }
        });
    },
    updateRiderPassword: async (id: string, password: string) => {
        await prisma.rider.update({
            where: { id },
            data: { password }
        });
    },
    deleteRider: async (id: string) => {
        await prisma.rider.delete({ where: { id } });
    },
    updateRiderPartner: async (id: string, partnerId: string | null) => {
        await prisma.rider.update({
            where: { id },
            // @ts-ignore
            data: { partnerId }
        });
    },

    // Brand Methods
    getBrands: async (category?: string) => {
        if (category) {
            const categories = [category];
            if (category === 'watch' || category === 'smartwatch') {
                categories.push('watch', 'smartwatch');
            }
            if (category === 'smartphone' || category === 'mobile') {
                categories.push('smartphone', 'mobile');
            }
            if (category === 'tablet' || category === 'ipad') {
                categories.push('tablet', 'ipad');
            }
            if (category === 'smarttv' || category === 'tv') {
                categories.push('smarttv', 'tv');
            }

            const where: any = {
                OR: [
                    { categories: { hasSome: categories } }
                ]
            };

            // Legacy fallback: untagged brands appear in smartphone section
            if (category === 'smartphone') {
                where.OR.push({ categories: { equals: [] } });
            }

            return await prisma.brand.findMany({
                where,
                orderBy: [{ priority: 'asc' }, { name: 'asc' }]
            });
        }
        return await prisma.brand.findMany({
            orderBy: [{ priority: 'asc' }, { name: 'asc' }]
        });
    },
    addBrand: async (brand: Brand) => {
        // If categories passed in brand object, they are saved.
        // We generally use higher level logic to handle upserts now.
        await prisma.brand.create({ data: brand });
    },
    addCategoryToBrand: async (id: string, category: string) => {
        const brand = await prisma.brand.findUnique({ where: { id } }) as any;
        if (brand && !brand.categories.includes(category)) {
            await prisma.brand.update({
                where: { id },
                data: { categories: { push: category } } as any
            });
        }
    },
    getBrand: async (id: string) => {
        return await prisma.brand.findUnique({ where: { id } });
    },
    removeCategoryFromBrand: async (id: string, category: string) => {
        const brand = await prisma.brand.findUnique({ where: { id } }) as any;
        if (!brand) return;
        const newCats = brand.categories.filter((c: string) => c !== category);
        if (newCats.length !== brand.categories.length) {
            if (newCats.length === 0) {
                // No categories left, delete brand
                await prisma.brand.delete({ where: { id } });
            } else {
                await prisma.brand.update({
                    where: { id },
                    data: { categories: newCats } as any
                });
            }
        }
    },
    updateBrand: async (id: string, name: string, logo: string, priority?: number) => {
        await prisma.brand.update({
            where: { id },
            data: { name, logo, priority }
        });
    },
    deleteBrand: async (id: string) => {
        await prisma.brand.delete({ where: { id } });
    },

    // Model Methods
    getModels: async (brandId?: string, category?: string) => {
        const where: any = {};
        if (brandId) where.brandId = brandId;

        if (category) {
            const cat = category.toLowerCase();
            if (cat === 'smartphone' || cat === 'mobile') {
                where.category = { in: ['smartphone', 'mobile', ''] };
            } else if (cat === 'watch' || cat === 'smartwatch') {
                where.category = { in: ['watch', 'smartwatch'] };
            } else if (cat === 'tablet' || cat === 'ipad') {
                where.category = { in: ['tablet', 'ipad'] };
            } else if (cat === 'smarttv' || cat === 'tv') {
                where.category = { in: ['smarttv', 'tv'] };
            } else {
                where.category = cat;
            }
        }

        return await prisma.model.findMany({
            where,
            orderBy: [{ priority: 'asc' }, { name: 'asc' }]
        });
    },
    searchModels: async (query: string) => {
        return await prisma.model.findMany({
            where: {
                name: { contains: query, mode: 'insensitive' }
            },
            take: 5,
            orderBy: [{ priority: 'asc' }, { name: 'asc' }]
        });
    },
    addModel: async (model: Model) => {
        await prisma.model.create({ data: model });
    },
    updateModel: async (id: string, brandId: string, name: string, img: string, category: string = 'smartphone', priority: number = 100) => {
        await prisma.model.update({
            where: { id },
            data: { brandId, name, img, category, priority } as any
        });
    },
    updateModelPriorities: async (items: { id: string, priority: number }[]) => {
        // Use a transaction for atomic updates
        await prisma.$transaction(
            items.map(item =>
                prisma.model.update({
                    where: { id: item.id },
                    data: { priority: item.priority }
                })
            )
        );
    },
    deleteModel: async (id: string) => {
        await prisma.model.delete({ where: { id } });
    },

    // Variant Methods
    getVariants: async (modelId?: string) => {
        if (modelId) return await prisma.variant.findMany({
            where: { modelId },
            orderBy: { basePrice: 'asc' }
        });
        return await prisma.variant.findMany({
            orderBy: { basePrice: 'asc' }
        });
    },
    addVariant: async (variant: Variant) => {
        await prisma.variant.create({ data: variant });
    },
    updateVariant: async (id: string, modelId: string, name: string, basePrice: number) => {
        await prisma.variant.update({
            where: { id },
            data: { modelId, name, basePrice }
        });
    },
    deleteVariant: async (id: string) => {
        await prisma.variant.delete({ where: { id } });
    },

    // Evaluation Rule Methods
    getEvaluationRules: async (category: string) => {
        // Defensive check for case where Prisma client might not be refreshed in build env
        const client = prisma as any;
        if (!client.evaluationRule) {
            console.warn("EvaluationRule model not found in Prisma client. Falling back to empty rules.");
            return [];
        }

        return await client.evaluationRule.findMany({
            where: { category }
        });
    },
    upsertEvaluationRule: async (data: { category: string, questionKey: string, answerKey: string, label: string, deductionAmount: number, deductionPercent: number }) => {
        const client = prisma as any;
        await client.evaluationRule.upsert({
            where: {
                category_questionKey_answerKey: {
                    category: data.category,
                    questionKey: data.questionKey,
                    answerKey: data.answerKey
                }
            } as any,
            create: data as any,
            update: {
                deductionAmount: data.deductionAmount,
                deductionPercent: data.deductionPercent,
                label: data.label
            } as any
        });
    }
};

function mapPrismaOrderToAppOrder(o: PrismaOrder & { orderNumber?: number, user?: any }): Order {
    return {
        id: o.id,
        orderNumber: o.orderNumber,
        userId: o.userId,
        user: o.user ? {
            id: o.user.id,
            name: o.user.name,
            email: o.user.email,
            phone: o.user.phone,
        } : null,
        device: o.device,
        price: o.price,
        date: o.createdAt.toISOString(),
        status: o.status,
        address: o.address,
        pincode: o.pincode,
        location: (o.locationLat && o.locationLng) ? { lat: o.locationLat, lng: o.locationLng } : null,
        riderId: o.riderId,
        answers: o.answers ? JSON.parse(o.answers) : null,
        riderAnswers: o.riderAnswers ? JSON.parse(o.riderAnswers) : null,
        verificationImages: o.verificationImages || [],
        offeredPrice: o.offeredPrice
    };
}
