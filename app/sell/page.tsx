
import { redirect } from 'next/navigation';
import SellWizard from "@/components/sell/SellWizard";

export const metadata = {
    title: "Book Onsite Repair - iProduct Repair",
    description: "Select your Apple device to get doorstep diagnostics and book an instant repair with certified engineers in Bangalore.",
};

import { fetchBrands } from "@/actions/catalog";
import { getSession } from "@/lib/session";

export default async function SellPage(props: { searchParams: Promise<{ category?: string; brandId?: string }> }) {
    const searchParams = await props.searchParams;
    let category = searchParams.category;
    const brandId = searchParams.brandId;

    // Redirect bare /sell to the repair flow — sell-device feature removed
    if (!category) {
        redirect('/sell?category=repair');
    }

    let fetchCategory = category;
    if (category === 'repair') {
        fetchCategory = 'laptop';
    }
    
    const allBrands = await fetchBrands(fetchCategory);
    let brands = allBrands;

    // Fetch user session for auth-dependent flows
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
