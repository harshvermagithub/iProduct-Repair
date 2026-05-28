import RefurbishedStore from "@/components/RefurbishedStore";
import { getSession } from "@/lib/session";

export const metadata = {
    title: "Certified Refurbished Apple Devices - iProduct Repair",
    description: "Shop premium pre-owned, renewed, and refurbished iPhones, MacBooks, iPads, and Apple Watches at cheap, budget-friendly costs in Bangalore with doorstep inspection.",
};

export default async function ShopPage() {
    const session = await getSession();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black pt-8 pb-16">
            <RefurbishedStore user={session?.user} />
        </div>
    );
}
