import { prisma } from '@/lib/db';
import AdminManager from '@/components/admin/AdminManager';

export const dynamic = 'force-dynamic';

export default async function AdminsPage() {
    const allUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    });

    const riders = await prisma.rider.findMany({
        orderBy: { createdAt: 'desc' }
    });

    const superAdmins = allUsers.filter(u => u.role === 'SUPER_ADMIN');
    const admins = allUsers.filter(u => u.role === 'ADMIN');
    const zonalHeads = allUsers.filter(u => u.role === 'ZONAL_HEAD');
    const relationshipManagers = allUsers.filter(u => u.role === 'RELATIONSHIP_MANAGER');
    const partners = allUsers.filter(u => u.role === 'PARTNER');
    
    // Combine native riders with users granted FIELD_EXECUTIVE privilege
    const fieldExecutiveUsers = allUsers.filter(u => u.role === 'FIELD_EXECUTIVE').map(u => ({
        id: u.id,
        name: u.name,
        phone: u.phone || u.email,
        status: 'available',
        partnerId: null
    }));
    
    const combinedRiders = [...riders, ...fieldExecutiveUsers];

    return (
        <div className="container mx-auto max-w-6xl w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Role Management Directory</h1>
                <p className="text-muted-foreground">View system administrators, zonal heads, partners, and field executives.</p>
            </div>

            <AdminManager
                superAdmins={superAdmins}
                admins={admins}
                zonalHeads={zonalHeads}
                relationshipManagers={relationshipManagers}
                partners={partners}
                riders={combinedRiders}
            />
        </div>
    );
}
