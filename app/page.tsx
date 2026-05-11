import { fetchBrands } from '@/actions/catalog';
import { HomeClient } from '@/components/HomeClient';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable caching to ensure fresh data since it's now dynamic


export default async function Home() {
    try {
        // Fetch critical data on the server with caching
        const brands = await fetchBrands('smartphone');

        // Fetch active cities mapped simply as string names, ordered by feature status and custom order
        const citiesObj = await prisma.city.findMany({
            where: { isActive: true },
            select: { name: true },
            orderBy: [
                { isFeatured: 'desc' },
                { displayOrder: 'asc' },
                { name: 'asc' }
            ]
        });
        const activeCities = citiesObj.map(c => c.name);

        // Fetch display prices for the hero animation
        const displayPrices = await prisma.deviceDisplayPrice.findMany();

        return <HomeClient initialBrands={brands} activeCities={activeCities} displayPrices={displayPrices} />;
    } catch (error: any) {
        return (
            <div className="flex min-h-screen items-center justify-center p-6 text-red-500 bg-black">
                <div className="max-w-2xl bg-slate-900 p-8 rounded-lg border border-red-900">
                    <h1 className="text-2xl font-bold mb-4">Server Error</h1>
                    <pre className="whitespace-pre-wrap break-words text-sm font-mono text-red-400">{error.message || String(error)}</pre>
                    <pre className="whitespace-pre-wrap break-words text-xs font-mono text-slate-500 mt-4">{error.stack}</pre>
                </div>
            </div>
        );
    }
}
