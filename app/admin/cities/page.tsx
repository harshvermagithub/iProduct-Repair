import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import PincodeInput from '@/components/admin/PincodeInput';

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
                        <div key={city.id} className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col gap-6">
                            <div className="flex justify-between items-center border-b pb-4">
                                <div>
                                    <h3 className="text-2xl font-black tracking-tighter">{city.name}</h3>
                                    <div className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mt-1">Operational Territory</div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${city.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {city.isActive ? 'Live' : 'Inactive'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Hierarchy Info */}
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Zonal Presence</h4>
                                        {zonalHeads.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {zonalHeads.map(zh => (
                                                    <div key={zh.id} className="text-[11px] font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200">{zh.name}</div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-[11px] text-muted-foreground italic">No Zonal Heads</div>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">Local Partners</h4>
                                        {partners.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {partners.map(p => (
                                                    <div key={p.id} className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">{p.name}</div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-[11px] text-muted-foreground italic">No Partners</div>
                                        )}
                                    </div>
                                </div>

                                {/* Pincode Management */}
                                <div className="bg-muted/30 p-5 rounded-2xl border border-muted-foreground/5 h-full">
                                    <form action={async (data) => {
                                        'use server';
                                        const pincodesStr = data.get('pincodes') as string;
                                        const pincodes = pincodesStr ? pincodesStr.split(',').map(p => p.trim()).filter(Boolean) : [];
                                        
                                        await prisma.city.update({
                                            where: { id: city.id },
                                            data: { pincodes }
                                        });
                                        revalidatePath('/admin/cities');
                                    }} className="flex flex-col h-full">
                                        <PincodeInput initialPincodes={city.pincodes || []} cityName={city.name} />
                                        <button type="submit" className="mt-4 w-full h-9 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-sm">
                                            Update Service Areas
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {!isZonalHead && (
                                <form action={async () => {
                                    'use server';
                                    await prisma.city.update({
                                        where: { id: city.id },
                                        data: { isActive: !city.isActive }
                                    });
                                    revalidatePath('/admin/cities');
                                }} className="pt-4 border-t flex justify-between items-center">
                                    <div className="text-[10px] text-slate-400 font-medium italic">Safety Lock Enabled</div>
                                    <button type="submit" className="text-[10px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors">
                                        Toggle Visibility
                                    </button>
                                </form>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
