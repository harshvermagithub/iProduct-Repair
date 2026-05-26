
import { getUserOrders } from '@/actions/orders';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Smartphone } from 'lucide-react';
import Link from 'next/link';
import OrderCard from '@/components/orders/OrderCard';

export default async function OrdersPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const orders = await getUserOrders();

    return (
        <div className="container mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">My Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-accent/20 rounded-2xl">
                    <Smartphone className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-lg font-medium">No orders yet</p>
                    <p className="text-muted-foreground mb-6">Book a doorstep repair to get started!</p>
                    <Link href="/sell?category=repair" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors">
                        Book Repair
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {orders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}
        </div>
    );
}
