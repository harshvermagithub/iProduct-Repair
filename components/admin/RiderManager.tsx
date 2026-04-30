
'use client';

import { useState, useEffect } from 'react';
import { addRider, deleteRider, updateRiderPartner, addFieldExecutive } from '@/actions/admin';
import { Trash2, Plus, Loader2, User, Phone, ChevronDown, ChevronUp, Package, AlertTriangle, Building2, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RiderManager({ initialRiders, partners = [], currentUserRole, currentUserId }: { initialRiders: any[], partners?: any[], currentUserRole?: string, currentUserId?: string }) {
    const router = useRouter();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [partnerId, setPartnerId] = useState(currentUserRole === 'PARTNER' ? currentUserId : '');
    const [filterPartner, setFilterPartner] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [grantEmail, setGrantEmail] = useState('');
    const [isGranting, setIsGranting] = useState(false);
    const [expandedRider, setExpandedRider] = useState<string | null>(null);

    const [riders, setRiders] = useState(initialRiders);
    useEffect(() => {
        setRiders(initialRiders);
    }, [initialRiders]);

    const filteredRiders = riders.filter((r: any) => {
        if (filterPartner === 'all') return true;
        if (filterPartner === 'unassigned') return !r.partnerId;
        return r.partnerId === filterPartner;
    });

    const toggleExpand = (id: string) => {
        setExpandedRider(expandedRider === id ? null : id);
    };

    const handleGrantExecutive = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!grantEmail) return;
        setIsGranting(true);
        try {
            const res = await addFieldExecutive(grantEmail);
            if (res.success) {
                setGrantEmail('');
                router.refresh();
            } else {
                alert(res.error || "Failed to grant role");
            }
        } catch {
            alert("Failed to grant role");
        } finally {
            setIsGranting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone) return;

        setIsLoading(true);
        try {
            await addRider(name, phone, partnerId || undefined);
            setName('');
            setPhone('');
            if (currentUserRole !== 'PARTNER') {
                setPartnerId('');
            }
            router.refresh();
        } catch {
            alert('Failed to add rider');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to remove this executive?')) return;
        try {
            setRiders(prev => prev.filter((r: any) => r.id !== id));
            await deleteRider(id);
            router.refresh();
        } catch {
            alert('Failed to delete executive');
            setRiders(initialRiders); // Revert on failure
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Register New Field Executive</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full h-10 px-3 border rounded-lg bg-background outline-none focus:border-primary transition-all text-sm"
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone Number</label>
                            <div className="flex items-center w-full h-10 border rounded-lg bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                                <span className="pl-3 pr-2 py-2 border-r border-border/50 text-muted-foreground font-medium text-xs bg-muted/20">+91</span>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 10) setPhone(val);
                                    }}
                                    className="w-full h-full px-3 text-sm outline-none bg-transparent"
                                    placeholder="9876543210"
                                />
                            </div>
                        </div>
                        {currentUserRole !== 'PARTNER' && partners.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Assign to Partner</label>
                                <select
                                    value={partnerId || ''}
                                    onChange={(e) => setPartnerId(e.target.value)}
                                    className="w-full h-10 px-3 border rounded-lg bg-background outline-none focus:border-primary transition-all text-sm"
                                >
                                    <option value="">None (Unassigned)</option>
                                    {partners.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <button
                            disabled={isLoading || !name || !phone}
                            className="w-full h-10 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 font-bold transition-all flex justify-center items-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <><Plus className="w-4 h-4" /> Register Logistics Staff</>}
                        </button>
                    </form>
                </div>

                <div className="bg-card border rounded-xl p-6 shadow-sm border-dashed">
                    <h3 className="text-lg font-bold mb-4">Grant Login Access</h3>
                    <p className="text-sm text-muted-foreground mb-6">Upgrade an existing registered user to Field Executive role so they can access the admin dashboard.</p>
                    
                    <form onSubmit={handleGrantExecutive} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">User Email Address</label>
                            <input
                                type="email"
                                value={grantEmail}
                                onChange={(e) => setGrantEmail(e.target.value)}
                                className="w-full h-10 px-3 border rounded-lg bg-background outline-none focus:border-primary transition-all text-sm"
                                placeholder="rider@fonzkart.in"
                                required
                            />
                        </div>
                        <button
                            disabled={isGranting || !grantEmail}
                            className="w-full h-10 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 font-bold transition-all flex justify-center items-center gap-2"
                        >
                            {isGranting ? <Loader2 className="animate-spin w-4 h-4" /> : <><Plus className="w-4 h-4" /> Grant Dashboard Access</>}
                        </button>
                    </form>
                </div>
            </div>

            {currentUserRole !== 'PARTNER' && partners.length > 0 && (
                <div className="flex flex-col md:flex-row justify-between md:items-center bg-card border rounded-xl p-6 gap-4">
                    <div>
                        <h3 className="text-sm font-bold">Filter By Partner</h3>
                        <p className="text-xs text-muted-foreground">View field executives assigned to specific partners.</p>
                    </div>
                    <select
                        value={filterPartner}
                        onChange={(e) => setFilterPartner(e.target.value)}
                        className="p-2 border rounded-lg bg-background w-full md:w-64 text-sm"
                    >
                        <option value="all">All Field Executives</option>
                        <option value="unassigned">Available Executives</option>
                        {partners.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                {filteredRiders.map((rider) => (
                    <div key={rider.id} className={`border rounded-xl bg-card overflow-hidden transition-all ${expandedRider === rider.id ? 'col-span-full shadow-md border-primary/30' : ''}`}>
                        <div
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => toggleExpand(rider.id)}
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold flex items-center gap-2">
                                        {rider.name}
                                        {rider.orders && rider.orders.length > 0 && (
                                            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">
                                                {rider.orders.length} Orders
                                            </span>
                                        )}
                                    </p>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Phone className="w-3 h-3" />
                                        +91 {rider.phone}
                                    </div>
                                    {rider.partner && (
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                                            Partner: <span className="font-semibold">{rider.partner.name}</span>
                                        </div>
                                    )}
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-2 inline-block ${rider.status === 'available' ? 'bg-green-100 text-green-700' :
                                        rider.status === 'busy' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {rider.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        handleDelete(e, rider.id);
                                    }}
                                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <a
                                    href={`/admin/orders?riderId=${rider.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    title="Open assignments in new tab"
                                    className="px-2.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors flex items-center justify-center font-bold"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleExpand(rider.id);
                                    }}
                                    className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors text-xs font-bold flex items-center"
                                >
                                    {expandedRider === rider.id ? 'Collapse' : 'Expand'}
                                    {expandedRider === rider.id ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                                </button>
                            </div>
                        </div>

                        {/* Expandable Orders Section */}
                        {expandedRider === rider.id && (
                            <div className="bg-muted/30 border-t p-4 space-y-3">
                                {currentUserRole !== 'PARTNER' && partners.length > 0 && (
                                    <div className="mb-4 bg-background border p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-primary" />
                                            <span className="text-sm font-semibold">Assigned Partner:</span>
                                        </div>
                                        <select
                                            value={rider.partnerId || ''}
                                            onChange={async (e) => {
                                                const newPartnerId = e.target.value || null;
                                                const previousPartnerId = rider.partnerId;
                                                // Handle API call directly using imported server action
                                                if (confirm(`Are you sure you want to reassign this executive?`)) {
                                                    try {
                                                        // Optimistic Update
                                                        setRiders(prev => prev.map((r: any) => r.id === rider.id ? { ...r, partnerId: newPartnerId } : r));
                                                        await updateRiderPartner(rider.id, newPartnerId);
                                                        router.refresh();
                                                    } catch (error) {
                                                        alert("Failed to assign partner. They might have been removed from the system.");
                                                        setRiders(prev => prev.map((r: any) => r.id === rider.id ? { ...r, partnerId: previousPartnerId } : r));
                                                    }
                                                }
                                            }}
                                            className="p-1.5 text-sm border rounded-md bg-background w-full sm:w-auto min-w-[150px]"
                                        >
                                            <option value="">None (Unassigned)</option>
                                            {partners.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Assigned Orders</h4>
                                {rider.orders && rider.orders.length > 0 ? (
                                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                                        {rider.orders.map((order: any) => (
                                            <div key={order.id} className="bg-background border rounded-lg p-3 text-sm flex gap-3">
                                                <div className="mt-1 shrink-0 text-primary">
                                                    <Package className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium line-clamp-1">{order.device}</p>
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1 truncate">{order.address}</p>
                                                    <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mt-3 gap-2">
                                                        <span className="font-semibold text-primary">₹{order.price.toLocaleString('en-IN')}</span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${order.status === 'pending_verification' ? 'bg-amber-100 text-amber-700' : 'bg-secondary text-secondary-foreground'}`}>
                                                            {order.status === 'pending_verification' ? 'Awaiting Approval' : order.status}
                                                        </span>
                                                    </div>

                                                    {order.status === 'pending_verification' && (
                                                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mt-3 w-full text-sm">
                                                            <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
                                                                <AlertTriangle className="w-4 h-4" /> Action Required
                                                            </h4>

                                                            <div className="space-y-3 mt-2">
                                                                <div>
                                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Rider Notes</p>
                                                                    <p className="font-medium text-amber-900 mt-0.5 text-xs">
                                                                        {order.riderAnswers ? JSON.parse(order.riderAnswers as string).notes || "No notes provided" : "None"}
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
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground italic text-center py-4 bg-background border rounded-lg border-dashed">
                                        No active orders assigned
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
