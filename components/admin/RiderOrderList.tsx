'use client';

import { useState } from 'react';
import { updateOrderStatus, submitVerification, logoutExecutive } from '@/actions/executive';
import { MapPin, Phone, Calendar, CheckCircle2, Navigation, LogOut, Zap, Eye, X, Camera, AlertTriangle, Package, User, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Order } from '@/lib/store';
import OrderDetails from '@/components/OrderDetails';
import VerificationModal from '@/components/admin/VerificationModal';

interface OrderAnswers {
    accessories?: string[];
    screen_defects?: string[];
    functional_problems?: string[];
    calls?: boolean;
    touch?: boolean;
    isExpress?: boolean;
    scheduledDate?: string;
    scheduledSlot?: string;
    adminRejectionLog?: Array<{ date: string; reason: string }>;
    phone?: string;
}

export default function RiderOrderList({ 
    orders, 
    executiveName, 
    isEmbedded = false 
}: { 
    orders: Order[], 
    executiveName: string,
    isEmbedded?: boolean 
}) {
    const router = useRouter();
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
    const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

    const handleStatusUpdate = async (id: string, newStatus: string, reason?: string) => {
        if (!confirm(`Mark order as ${newStatus}?`)) return;
        setUpdatingId(id);
        try {
            await updateOrderStatus(id, newStatus, reason);
            router.refresh();
        } catch {
            alert('Failed to update');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleVerificationSubmit = async (data: any) => {
        if (!verifyingOrder) return;
        setUpdatingId(verifyingOrder.id);
        try {
            await submitVerification(verifyingOrder.id, {
                riderAnswers: { 
                    notes: data.notes, 
                    imei: data.imei,
                    imei2: data.imei2,
                    verifiedAt: new Date().toISOString()
                },
                verificationImages: data.images,
                offeredPrice: data.finalOffer
            });
            alert('Verification submitted with IMEI ' + data.imei + ' for admin approval.');
            setVerifyingOrder(null);
            router.refresh();
        } catch {
            alert('Failed to submit verification');
        } finally {
            setUpdatingId(null);
        }
    };

    const pendingOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'failed' && o.status !== 'cancelled' && o.status !== 'unpicked');
    const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'failed' || o.status === 'cancelled' || o.status === 'unpicked');
    const displayedOrders = activeTab === 'pending' ? pendingOrders : completedOrders;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {!isEmbedded && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">My Pickups</h1>
                        <p className="text-muted-foreground">Welcome, {executiveName}</p>
                    </div>
                    <button
                        onClick={() => logoutExecutive()}
                        className="self-end sm:self-auto p-2 hover:bg-muted rounded-full bg-muted/50 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            )}

            {!isEmbedded && (
                <div className="flex bg-muted/50 p-1 rounded-xl w-full sm:w-fit">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Pending <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{pendingOrders.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'completed' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Finished <span className="ml-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">{completedOrders.length}</span>
                    </button>
                </div>
            )}

            {displayedOrders.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-2xl border">
                    <p className="text-muted-foreground">No orders found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {displayedOrders.map((order) => {
                        const answersObj: OrderAnswers = (typeof order.answers === 'string') ? JSON.parse(order.answers) : (order.answers || {});
                        const hasRejection = answersObj.adminRejectionLog && answersObj.adminRejectionLog.length > 0;
                        const lastRejection = hasRejection ? answersObj.adminRejectionLog![answersObj.adminRejectionLog!.length - 1] : null;

                        return (
                            <div key={order.id} className="border bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-4 sm:p-6 bg-gradient-to-r from-accent/50 to-transparent flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 sm:p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                                            <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-base sm:text-lg text-foreground line-clamp-1">{order.device}</p>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1 sm:mt-1.5 font-mono text-xs text-muted-foreground">
                                                <span>FZK-{order.orderNumber || ''}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span>{new Date(order.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center sm:block mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-border/50">
                                        <span className="text-muted-foreground text-sm sm:hidden w-1/2">Estimate:</span>
                                        <p className="font-bold text-lg text-primary sm:text-right">
                                            ₹{order.status === 'pending_verification' && order.offeredPrice ? order.offeredPrice.toLocaleString() : order.price.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 sm:p-6 space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm bg-muted/30 p-4 rounded-xl border border-border/50">
                                        <div className="flex items-start gap-2 flex-1">
                                            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground line-clamp-2">
                                                {order.address || "Location captured via GPS"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 border-t sm:border-l sm:border-t-0 pt-3 sm:pt-0 sm:pl-4 border-border/50">
                                            <Navigation className="w-4 h-4 text-primary" />
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-bold text-primary hover:underline"
                                            >
                                                View on Map
                                            </a>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
                                                <User className="w-3 h-3" /> Customer Information
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-sm font-bold text-foreground">
                                                    {order.user?.name || "No name provided"}
                                                </p>
                                                
                                                {/* Phone FIRST */}
                                                {(answersObj.phone || order.user?.phone) && (
                                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                                        <Phone className="w-4 h-4 text-green-600" />
                                                        <span className="font-bold">+91 {answersObj.phone || order.user?.phone}</span>
                                                    </div>
                                                )}

                                                {/* Gmail SECOND */}
                                                {order.user?.email && (
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Zap className="w-3 h-3 text-blue-500" />
                                                        <span className="truncate">{order.user.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <div className="bg-muted/10 border p-3 rounded-lg flex items-center gap-2 overflow-hidden text-sm h-fit">
                                                <CheckCircle2 className={`w-4 h-4 shrink-0 ${order.status === 'completed' ? 'text-green-500' : order.status === 'failed' ? 'text-red-500' : 'text-muted-foreground'}`} />
                                                <span className="truncate text-muted-foreground font-medium capitalize">
                                                    {order.status === 'pending_verification' ? 'Awaiting Approval' : order.status}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <a 
                                                    href={`tel:+91${answersObj.phone || order.user?.phone}`}
                                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold transition-all shadow-sm"
                                                >
                                                    <Phone className="w-4 h-4" /> Call
                                                </a>
                                                <button
                                                    onClick={() => {
                                                        const reason = window.prompt("Mark order as FAILED. Reason:", "Customer not reachable");
                                                        if (reason === null) return;
                                                        handleStatusUpdate(order.id, 'failed', reason);
                                                    }}
                                                    className="px-4 py-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all"
                                                    title="Fail Order"
                                                >
                                                    Fail
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {order.status === 'assigned' && (
                                    <div className="pt-4 space-y-4 mx-4 sm:mx-6 mb-4 sm:mb-6">
                                        {hasRejection && (
                                            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl mb-4">
                                                <h4 className="font-bold text-destructive flex items-center gap-2 mb-2">
                                                    <AlertTriangle className="w-5 h-5" /> Admin Feedback / Price Range
                                                </h4>
                                                <p className="text-sm text-destructive-foreground">
                                                    {lastRejection!.reason}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-2 italic">Please negotiate with the customer based on this range/feedback and verify condition again.</p>
                                            </div>
                                        )}

                                        <div className="bg-background border p-4 rounded-xl">
                                            <h4 className="font-semibold text-foreground flex items-center justify-between mb-4">
                                                <span>1. Review Customer Order</span>
                                                <button onClick={() => setViewingOrder(order)} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                                                    <Eye className="w-3 h-3" /> Full Details
                                                </button>
                                            </h4>

                                            <div className="bg-muted/50 p-4 rounded-lg text-xs space-y-2 border">
                                                {order.answers ? (() => {
                                                    const ans = (typeof order.answers === 'string') ? JSON.parse(order.answers) : order.answers;
                                                    return (
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="col-span-2 sm:col-span-1">
                                                                <span className="text-muted-foreground block mb-0.5">Physical Condition</span>
                                                                <span className="font-bold capitalize">{(ans.physical_condition || 'N/A').replace(/_/g, ' ')}</span>
                                                            </div>
                                                            <div className="col-span-2 sm:col-span-1">
                                                                <span className="text-muted-foreground block mb-0.5">Body Condition</span>
                                                                <span className="font-bold capitalize">{(ans.body_condition || 'N/A').replace(/_/g, ' ')}</span>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <span className="text-muted-foreground block mb-0.5">Reported Issues</span>
                                                                <span className="font-bold capitalize text-red-500">
                                                                    {(ans.functional_issues && ans.functional_issues.length > 0)
                                                                        ? ans.functional_issues.join(', ').replace(/_/g, ' ')
                                                                        : 'None reported'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })() : (
                                                    <p className="text-muted-foreground italic">No details available.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-background border p-4 rounded-xl space-y-4">
                                            <h4 className="font-semibold text-foreground">2. Physical Verification</h4>
                                            <p className="text-xs text-muted-foreground">Verify the actual condition matches the customer's report. Take photos and recalculate price if defects are found.</p>

                                            <button
                                                onClick={() => setVerifyingOrder(order)}
                                                disabled={!!updatingId}
                                                className="w-full py-3 bg-secondary text-secondary-foreground font-bold rounded-xl hover:bg-secondary/80 transition-all flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <Camera className="w-5 h-5" />
                                                Start Verification (IMEI Required)
                                            </button>
                                            <div className="text-center">
                                                <span className="text-xs text-muted-foreground mx-2 uppercase tracking-widest font-bold">OR</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Confirm you have verified device perfectly matches the report and user accepted ₹${order.price}?`)) {
                                                        handleStatusUpdate(order.id, 'picked_up');
                                                    }
                                                }}
                                                disabled={!!updatingId}
                                                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                                            >
                                                <CheckCircle2 className="w-5 h-5" />
                                                Condition Matches Perfectly
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {order.status === 'pending_verification' && (
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl text-center space-y-2">
                                        <AlertTriangle className="w-8 h-8 mx-auto text-amber-500" />
                                        <h4 className="font-bold text-amber-700 dark:text-amber-400">Awaiting Admin Approval</h4>
                                        <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
                                            You've submitted new photos and a revised price of ₹{order.offeredPrice}. Please ask the customer to wait while the Zonal Head approves it.
                                        </p>
                                    </div>
                                )}

                                {order.status === 'picked_up' && (
                                    <div className="pt-2 space-y-3">
                                        <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 p-3 rounded-lg text-sm text-center font-bold">
                                            Device Verified & Payment Accepted! <br /> <span className="font-medium">Please proceed to deliver to the Hub.</span>
                                        </div>
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, 'completed')}
                                            disabled={!!updatingId}
                                            className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-sm transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                            Mark Delivered to Hub
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {viewingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-background rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur z-10">
                            <h3 className="font-bold text-lg">Evaluation Report</h3>
                            <button onClick={() => setViewingOrder(null)} className="p-2 hover:bg-muted rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <OrderDetails order={viewingOrder} />
                        </div>
                    </div>
                </div>
            )}

            {verifyingOrder && (
                <VerificationModal
                    order={verifyingOrder}
                    onClose={() => setVerifyingOrder(null)}
                    onSubmit={handleVerificationSubmit}
                />
            )}
        </div>
    );
}
