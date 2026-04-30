
import SellWizard from "@/components/sell/SellWizard";

export const metadata = {
    title: "Sell Your Phone - Fonzkart",
    description: "Select your device and get the best price.",
};

import { fetchBrands } from "@/actions/catalog";
import { getSession } from "@/lib/session";

export default async function SellPage(props: { searchParams: Promise<{ category?: string; brandId?: string }> }) {
    const searchParams = await props.searchParams;
    const category = searchParams.category;
    const brandId = searchParams.brandId;
    let fetchCategory = category;
    if (category === 'unbreakable-screenguard' || category === 'repair') {
        fetchCategory = 'smartphone';
    }
    
    const allBrands = await fetchBrands(fetchCategory);
    let brands = allBrands;
    
    if (category === 'unbreakable-screenguard') {
        const requiredBrands = ['Apple', 'Samsung', 'OnePlus', 'Google'];
        brands = allBrands.filter(b => requiredBrands.includes(b.name));
    }

    // Fetch user session for auth-dependent flows (e.g., skip phone number step)
    const session = await getSession();

    return (
        <div className="container mx-auto py-10 px-4">
            <SellWizard
                key={category}
                initialBrands={brands}
                initialCategory={category}
                initialBrandId={brandId}
                user={session?.user}
            />
        </div>
    );
}
