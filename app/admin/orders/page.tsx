import { db } from "@/lib/store";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import OrderManager from "@/components/admin/OrderManager";
import RiderOrderList from "@/components/admin/RiderOrderList";

export const dynamic = 'force-dynamic';

export default async function OrdersPage(props: { searchParams?: Promise<{ riderId?: string }> }) {
    const searchParams = await props.searchParams;
    const filterRiderId = searchParams?.riderId;

    const session = await getSession();
    if (!session || !session.user) redirect('/login');

    const currentUser: any = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { managedCities: true }
    });

    if (!currentUser) redirect('/login');

    let orders = await db.getAllOrders();
    let riders = await prisma.rider.findMany({
        include: {
            partner: {
                select: { pincodes: true }
            }
        }
    });

    if (currentUser.role === 'PARTNER') {
        const allowedPincodes = currentUser.pincodes || [];
        orders = orders.filter(o => o.pincode && allowedPincodes.includes(o.pincode));
        riders = riders.filter(r => r.partnerId === currentUser.id);
    } else if (currentUser.role === 'FIELD_EXECUTIVE') {
        const rider = await prisma.rider.findFirst({
            where: { phone: currentUser.phone || '' }
        });
        if (rider) {
            orders = orders.filter(o => o.riderId === rider.id);
        } else {
            orders = [];
        }
        riders = []; // Riders don't need to see other riders
    } else if (currentUser.role === 'ZONAL_HEAD') {
        if (currentUser.managedCities.length > 0) {
            const managedCityIds = currentUser.managedCities.map((c: any) => c.id);
            const managedCityNames = currentUser.managedCities.map((c: any) => c.name.toLowerCase());

            // Find all Pincodes managed by Partners in this Zonal Head's cities
            const cityPartners = await prisma.user.findMany({
                where: { 
                    role: 'PARTNER', 
                    cityId: { in: managedCityIds } 
                }
            });
            const allowedPincodes = cityPartners.flatMap(p => p.pincodes);
            const partnerIds = cityPartners.map(p => p.id);

            orders = orders.filter(o =>
                (o.pincode && allowedPincodes.includes(o.pincode)) ||
                (o.address && managedCityNames.some((name: any) => o.address?.toLowerCase().includes(name)))
            );
            riders = riders.filter(r => r.partnerId && partnerIds.includes(r.partnerId));
        } else {
            // If they are not assigned to any city, they see no orders
            orders = [];
            riders = [];
        }
    }
    // SUPER_ADMIN and ADMIN see all orders

    if (filterRiderId) {
        orders = orders.filter(o => o.riderId === filterRiderId);
    }

    if (currentUser.role === 'FIELD_EXECUTIVE') {
        return <RiderOrderList orders={orders} executiveName={currentUser.name} isEmbedded={true} />;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent uppercase">
                {currentUser.role === 'FIELD_EXECUTIVE' ? 'My Pickups' : filterRiderId ? `Orders for Field Executive` : `Manage Orders`}
            </h1>
            {currentUser.role === 'ZONAL_HEAD' && (
                <p className="text-muted-foreground text-sm font-medium text-primary">
                    Territory Overview: {currentUser.managedCities.map((c: any) => c.name).join(', ') || 'Unassigned'}
                </p>
            )}
            {currentUser.role === 'PARTNER' && <p className="text-muted-foreground text-sm font-medium text-emerald-600">Assigned Pincodes: {currentUser.pincodes?.join(', ') || 'None'}</p>}
            <p className="text-muted-foreground">
                {currentUser.role === 'FIELD_EXECUTIVE' 
                    ? 'View and manage your currently assigned sell requests and pick-up tasks.'
                    : 'View incoming sell requests and assign field executives for pickup.'
                }
            </p>
            <OrderManager initialOrders={orders} riders={riders} userRole={currentUser.role} />
        </div>
    );
}
