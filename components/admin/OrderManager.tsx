
'use client';

import { useState, useEffect } from 'react';
import { assignRider } from '@/actions/admin';
import { Rider, Order } from '@/lib/store'; // Need to export Order from store/lib
import { Calendar, MapPin, Smartphone, User, CheckCircle2, Eye, X, Download, Phone, Mail, AlertTriangle, Trash2, CheckSquare, Square, Camera } from 'lucide-react';
import OrderDetails from '@/components/OrderDetails';
import { useRouter } from 'next/navigation';

import OrderStepper from '@/components/orders/OrderStepper';

export default function OrderManager({ 
    initialOrders, 
    riders, 
    userRole = 'SUPER_ADMIN' 
}: { 
    initialOrders: Order[], 
    riders: Rider[], 
    userRole?: string 
}) {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>(initialOrders);

    const isRider = userRole === 'RIDER';

    const [activeTab, setActiveTab] = useState<'to_be_assigned' | 'pending_pickup' | 'completed' | 'failed'>(
        isRider ? 'pending_pickup' : 'to_be_assigned'
    );

    // Sync if server sends new orders (e.g. from polling or navigations)
    useEffect(() => {
        setOrders(initialOrders);
    }, [initialOrders]);

    // Auto-refresh every 30 seconds to sync with server/database
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 30000);
        return () => clearInterval(interval);
    }, [router]);

    const [assigningId, setAssigningId] = useState<string | null>(null);
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    const handleAssign = async (orderId: string, riderId: string) => {
        if (!riderId) return;
        setAssigningId(orderId);
        try {
            await assignRider(orderId, riderId);
            // Optimistically update the UI to instantly move to the new tab!
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, riderId, status: 'assigned' } : o));
            router.refresh();
        } catch (error: any) {
            alert(error.message || 'Failed to assign rider');
        } finally {
            setAssigningId(null);
        }
    };

    // Sort by date desc
    const sortedOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const toBeAssignedOrders = sortedOrders.filter(o => !o.riderId && o.status !== 'completed' && o.status !== 'failed');
    const pendingPickupOrders = sortedOrders.filter(o => o.riderId && o.status !== 'completed' && o.status !== 'failed');
    const completedOrders = sortedOrders.filter(o => o.status === 'completed');
    const failedOrders = sortedOrders.filter(o => o.status === 'failed');

    const displayedOrders = activeTab === 'to_be_assigned'
        ? toBeAssignedOrders
        : activeTab === 'pending_pickup'
            ? pendingPickupOrders
            : activeTab === 'completed'
                ? completedOrders
                : failedOrders;

    const handleBulkFail = async () => {
        if (selectedOrderIds.length === 0) return;
        const reason = window.prompt(`Mark ${selectedOrderIds.length} orders as FAILED. Reason:`, "Bulk failure");
        if (reason === null) return;
        if (!confirm(`Are you sure you want to fail ${selectedOrderIds.length} orders?`)) return;

        setIsBulkProcessing(true);
        try {
            await fetch('/api/admin/orders/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'bulk_fail', ids: selectedOrderIds, reason })
            });
            setSelectedOrderIds([]);
            window.location.reload();
        } catch {
            alert('Failed to process bulk fail');
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedOrderIds.length === 0) return;
        if (!confirm(`CAUTION: This will PERMANENTLY delete ${selectedOrderIds.length} orders. Proceed?`)) return;

        setIsBulkProcessing(true);
        try {
            await fetch('/api/admin/orders/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'bulk_delete', ids: selectedOrderIds })
            });
            setSelectedOrderIds([]);
            window.location.reload();
        } catch {
            alert('Failed to process bulk delete');
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedOrderIds.length === displayedOrders.length) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(displayedOrders.map(o => o.id));
        }
    };

    const toggleSelectOrder = (id: string) => {
        setSelectedOrderIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleExport = () => {
        const headers = ["Order #", "Date", "Device", "Price", "Status", "Contact", "Address", "Rider Assigned"];
        const rows = displayedOrders.map(o => {
            const answers = (typeof o.answers === 'string') ? JSON.parse(o.answers) : (o.answers || {});
            const phone = answers.phone || "N/A";
            const isExpress = answers.isExpress ? "Express" : "Standard";
            const riderAssign = riders.find(r => r.id === o.riderId)?.name || "Unassigned";
            return [
                `FZK-${o.orderNumber || ''}`,
                new Date(o.date).toLocaleDateString(),
                `"${o.device.replace(/"/g, '""')}"`,
                o.price,
                o.status,
                phone,
                `"${o.address.replace(/"/g, '""')}"`,
                riderAssign
            ].join(",");
        });

        const csvString = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Fonzkart_Orders_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex flex-wrap bg-muted/50 p-1 rounded-lg border border-border/50 gap-1">
                    <button
                        onClick={() => setActiveTab('to_be_assigned')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'to_be_assigned' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        To Be Assigned <span className="ml-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{toBeAssignedOrders.length}</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('pending_pickup')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'pending_pickup' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        In Transit <span className="ml-1.5 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs">{pendingPickupOrders.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'completed' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Completed <span className="ml-1.5 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">{completedOrders.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('failed')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'failed' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Failed <span className="ml-1.5 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs">{failedOrders.length}</span>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {selectedOrderIds.length > 0 && (
                        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg border mr-2 animate-in fade-in slide-in-from-right-4">
                            <span className="text-xs font-bold px-2 text-muted-foreground">{selectedOrderIds.length} selected</span>
                            <button
                                onClick={handleBulkFail}
                                disabled={isBulkProcessing}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-xs font-bold hover:bg-red-200 transition-colors disabled:opacity-50"
                            >
                                <AlertTriangle className="w-3.5 h-3.5" /> Fail Selected
                            </button>
                            {activeTab === 'failed' && (
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={isBulkProcessing}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white rounded-md text-xs font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedOrderIds([])}
                                className="p-1.5 hover:bg-background rounded-md text-muted-foreground transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-sm shrink-0"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            {displayedOrders.length > 0 && (
                <div className="flex items-center gap-2 px-2 pb-2">
                    <button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {selectedOrderIds.length === displayedOrders.length ? (
                            <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                            <Square className="w-4 h-4" />
                        )}
                        {selectedOrderIds.length === displayedOrders.length ? "Deselect All" : "Select All Current"}
                    </button>
                </div>
            )}
            {displayedOrders.length === 0 ? (
                <div className="text-center py-10 border rounded-xl bg-card text-muted-foreground">
                    No orders found in this category.
                </div>
            ) : (
                <div className="grid gap-4">
                    {displayedOrders.map((order) => {
                        const isSelected = selectedOrderIds.includes(order.id);
                        const assignedRider = riders.find(r => r.id === order.riderId);
                        const answers = (typeof order.answers === 'string')
                            ? JSON.parse(order.answers)
                            : (order.answers as Record<string, any> || {});
                        const phone = answers.phone;

                        return (
                            <div key={order.id} className="bg-card border rounded-xl p-6 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleSelectOrder(order.id);
                                            }}
                                            className={`transition-all ${isSelected ? 'text-primary scale-110' : 'text-muted-foreground opacity-50 hover:opacity-100'}`}
                                        >
                                            {isSelected ? <CheckSquare className="w-5 h-5 shadow-sm" /> : <Square className="w-5 h-5" />}
                                        </button>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            order.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                order.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-amber-100 text-amber-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                        <span suppressHydrationWarning className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(order.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold flex flex-col items-start gap-1">
                                        <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-widest block"># FZK-{order.orderNumber}</span>
                                        <span className="flex items-center gap-2">
                                            <Smartphone className="w-5 h-5 text-gray-500" />
                                            {order.device}
                                        </span>
                                    </h3>

                                    {/* Pickup Schedule Badge */}
                                    {(() => {
                                        const isExpress = !!answers.isExpress;
                                        const scheduledDate = answers.scheduledDate ? new Date(answers.scheduledDate) : null;
                                        const scheduledSlot = answers.scheduledSlot;

                                        if (isExpress) {
                                            return (
                                                <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 w-fit">
                                                    ⚡ Express Pickup (3H)
                                                </div>
                                            );
                                        }

                                        if (scheduledDate && scheduledSlot) {
                                            return (
                                                <div className="mt-1 text-xs text-muted-foreground flex items-center gap-3 bg-muted/50 w-fit px-2 py-1 rounded">
                                                    <span suppressHydrationWarning className="flex items-center gap-1 font-medium text-foreground">
                                                        <Calendar className="w-3 h-3" />
                                                        {scheduledDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                        {scheduledSlot}
                                                    </span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                    <div className="text-lg font-mono font-bold text-green-600">
                                        ₹{order.price.toLocaleString()}
                                    </div>
                                    <div className="flex flex-col gap-2 mt-4">
                                        <div className="bg-muted/30 p-3 rounded-xl border border-border/50 space-y-2">
                                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Customer Details</div>
                                            {order.user && (
                                                <>
                                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                                        <User className="w-4 h-4 text-primary" />
                                                        <span className="font-semibold">{order.user.name || "N/A"}</span>
                                                    </div>
                                                    
                                                    {/* Contact Number FIRST */}
                                                    {(phone || order.user.phone) && (
                                                        <div className="flex items-center gap-2 text-sm text-foreground">
                                                            <Phone className="w-4 h-4 text-primary" />
                                                            <span className="font-bold tracking-wide">+91 {phone || order.user.phone}</span>
                                                        </div>
                                                    )}

                                                    {/* Email SECOND */}
                                                    {order.user.email && (
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Mail className="w-4 h-4 text-primary" />
                                                            <span>{order.user.email}</span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            {(!order.user && !phone) && (
                                                <div className="text-sm text-muted-foreground italic">No details available</div>
                                            )}
                                        </div>
                                        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/50">
                                            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                            <span>{order.address || "Location captured via GPS"}</span>
                                        </div>
                                        {order.pincode && (
                                            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border/50 mt-2">
                                                <span className="font-bold">Pincode:</span>
                                                <span>{order.pincode}</span>
                                            </div>
                                        )}
                                    </div>

                                    <button
                        onClick={() => setViewingOrder(order)}
                                        className="text-sm font-medium text-primary hover:underline flex items-center gap-1 mt-1"
                                    >
                                        <Eye className="w-4 h-4" /> View Evaluation Details
                                    </button>
                                </div>

                                <div className="w-full lg:w-auto min-w-[300px] border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6 space-y-4">
                                    {!isRider && (
                                        <div>
                                            <label className="text-sm font-medium mb-1 block text-slate-500 uppercase tracking-tighter text-[10px]">Assign Field Executive</label>
                                            <div className="flex gap-2">
                                                {(() => {
                                                    const availableRiders = riders.filter(r => {
                                                        if (!order.pincode) return true;
                                                        // @ts-ignore
                                                        if (r.partner && r.partner.pincodes && r.partner.pincodes.length > 0) {
                                                            // @ts-ignore
                                                            return r.partner.pincodes.includes(order.pincode);
                                                        }
                                                        return true;
                                                    }).sort((a, b) => a.status === 'available' ? -1 : 1);

                                                    return (
                                                        <select
                                                            className="flex-1 p-2 border rounded-lg bg-background text-sm"
                                                            value={order.riderId || ""}
                                                            onChange={(e) => handleAssign(order.id, e.target.value)}
                                                            disabled={assigningId === order.id}
                                                        >
                                                            <option value="">Select Field Executive...</option>
                                                            {availableRiders.map(r => (
                                                                <option key={r.id} value={r.id}>
                                                                    {r.name} ({r.status.toUpperCase()})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    );
                                                })()}
                                                {assigningId === order.id && (
                                                    <div className="flex items-center justify-center p-2">
                                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    const reason = window.prompt("Mark order as FAILED. Reason:", "Customer unavailable");
                                                    if (reason === null) return;
                                                    if (confirm("Are you sure you want to fail this order?")) {
                                                        await fetch('/api/admin/orders/' + order.id, {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ action: 'fail_order', reason })
                                                        });
                                                        window.location.reload();
                                                    }
                                                }}
                                                className="w-full mt-2 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                Fail Order
                                            </button>
                                        </div>
                                    )}

                                    {isRider && order.status === 'assigned' && (
                                        <button
                                            onClick={() => router.push('/pickup/dashboard')}
                                            className="w-full py-3 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 uppercase tracking-widest text-xs"
                                        >
                                            <Camera className="w-5 h-5 mx-1" />
                                            Start Evaluation
                                        </button>
                                    )}

                                    {assignedRider && (
                                        <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm flex items-center gap-3">
                                            <div className="bg-white p-1 rounded-full shrink-0">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold">{assignedRider.name}</p>
                                                <p className="text-xs">+91 {assignedRider.phone}</p>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 mt-1 rounded-full inline-block uppercase ${assignedRider.status === 'available' ? 'bg-green-100 text-green-700' :
                                                    assignedRider.status === 'busy' ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-700'}`}>
                                                    {assignedRider.status}
                                                </span>
                                            </div>
                                            <CheckCircle2 className="w-5 h-5 ml-auto opacity-50 shrink-0" />
                                        </div>
                                    )}

                                    {order.status === 'pending_verification' && (
                                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mt-3 w-full text-sm">
                                            <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
                                                <AlertTriangle className="w-4 h-4" /> Action Required
                                            </h4>

                                            <div className="space-y-3 mt-2">
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Rider Notes</p>
                                                    <p className="font-medium text-amber-900 mt-0.5 text-xs">
                                                        {order.riderAnswers
                                                            ? ((typeof order.riderAnswers === 'string' ? JSON.parse(order.riderAnswers) : order.riderAnswers).notes || "No notes provided")
                                                            : "None"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Device Photos</p>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {(order.verificationImages || []).map((img: string, i: number) => (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <a href={img} target="_blank" rel="noopener noreferrer" key={i}>
                                                                <img src={img} alt="Device Photo" className="w-12 h-12 object-cover rounded-md border shadow-sm hover:scale-105 transition-transform" />
                                                            </a>
                                                        ))}
                                                        {(!order.verificationImages || order.verificationImages.length === 0) && (
                                                            <p className="text-xs italic text-muted-foreground">No photos uploaded.</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between bg-white/60 p-2 rounded-lg border border-amber-200 text-xs">
                                                    <span className="font-medium text-muted-foreground">Old: <span className="line-through">₹{order.price.toLocaleString()}</span></span>
                                                    <span className="font-bold text-amber-900 text-sm">New: ₹{order.offeredPrice?.toLocaleString() ?? "N/A"}</span>
                                                </div>

                                                <div className="flex gap-2 pt-1">
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            const reason = window.prompt("Reject verification. Please provide a reason or suggested price range for the rider:", "Recheck physical condition or offer max 12000");
                                                            if (reason === null) return; // Cancelled
                                                            await fetch('/api/admin/orders/' + order.id, {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ action: 'reject_verification', reason })
                                                            });
                                                            window.location.reload();
                                                        }}
                                                        className="px-3 py-1.5 border border-amber-300 text-amber-800 hover:bg-amber-100 rounded-md font-semibold w-1/3 text-xs"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            const priceInput = window.prompt("Adjust the final approved price if needed:", order.offeredPrice?.toString() || order.price.toString());
                                                            if (priceInput === null) return; // cancelled
                                                            const overridePrice = parseInt(priceInput, 10);
                                                            if (isNaN(overridePrice) || overridePrice < 0) {
                                                                alert("Invalid price entered.");
                                                                return;
                                                            }
                                                            if (confirm(`Approve with final price of ₹${overridePrice}?`)) {
                                                                await fetch('/api/admin/orders/' + order.id, { method: 'POST', body: JSON.stringify({ action: 'approve_verification', overridePrice }) });
                                                                window.location.reload();
                                                            }
                                                        }}
                                                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white shadow-sm rounded-md font-bold w-2/3 text-xs"
                                                    >
                                                        Approve
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'failed' && (
                                        <button
                                            onClick={async () => {
                                                if (confirm("Permanently delete this failed order?")) {
                                                    await fetch('/api/admin/orders/bulk', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ action: 'bulk_delete', ids: [order.id] })
                                                    });
                                                    window.location.reload();
                                                }
                                            }}
                                            className="w-full mt-2 py-2 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
                                        </button>
                                    )}

                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {viewingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-background rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-background/95 backdrop-blur z-20">
                            <h3 className="font-bold text-lg">Evaluation Details (FZK-{viewingOrder.orderNumber})</h3>
                            <button onClick={() => setViewingOrder(null)} className="p-2 hover:bg-muted rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="sticky top-[64px] bg-background border-b z-10 w-full px-6 pt-2 pb-1">
                            <OrderStepper status={viewingOrder.status} />
                        </div>
                        <div className="p-6">
                            <OrderDetails order={viewingOrder} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
