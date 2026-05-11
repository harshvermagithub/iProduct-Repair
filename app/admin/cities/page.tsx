import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import CityCard from '@/components/admin/CityCard';

export const dynamic = 'force-dynamic';

export default async function CitiesAdminPage() {
    const session = await getSession();
    if (!session || !session.user) redirect('/login');

    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
    const isZonalHead = currentUser?.role === 'ZONAL_HEAD';

    const defaultCities = ['Madurai', 'Chennai', 'Coimbatore'];

    // Auto-seed default cities if they don't exist
    if (!isZonalHead) {
        for (const city of defaultCities) {
            await prisma.city.upsert({
                where: { name: city },
                update: {},
                create: { name: city, isActive: true }
            });
        }
    }

    const cities = await prisma.city.findMany({
        where: isZonalHead && currentUser?.cityId ? { id: currentUser.cityId } : {},
        include: {
            users: true
        },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-8 w-full">
            <div className="flex flex-col gap-6 p-8 bg-slate-950 text-white rounded-[2rem] shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32 rounded-full group-hover:bg-emerald-500/20 transition-all duration-700"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                            Operational Control
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none mb-4">
                            Service <span className="text-emerald-500 underline decoration-8 decoration-emerald-500/20 underline-offset-8">Cities</span>
                        </h1>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                            Expand Fonzkart's footprint. Register new operational hubs and manage the master pincode directory for each territory below.
                        </p>
                    </div>

                    <form action={async (data) => {
                        'use server';
                        const name = data.get('cityName') as string;
                        if (name) {
                            await prisma.city.upsert({
                                where: { name },
                                update: { isActive: true },
                                create: { name, isActive: true }
                            });
                            revalidatePath('/admin/cities');
                        }
                    }} className="relative z-10 flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <input
                                name="cityName"
                                required
                                placeholder="Enter City Name (e.g. Bangalore)"
                                className="w-full h-14 pl-5 pr-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
                            />
                        </div>
                        <button type="submit" className="h-14 px-8 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                            Register Hub
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-8">
                {cities.map(city => {
                    const zonalHeads = city.users.filter(u => u.role === 'ZONAL_HEAD');
                    const partners = city.users.filter(u => u.role === 'PARTNER');

                    return (
                        <CityCard 
                            key={city.id} 
                            city={city} 
                            partners={partners} 
                            zonalHeads={zonalHeads} 
                            isZonalHead={isZonalHead} 
                        />
                    );
                })}
            </div>
        </div>
    );
}
