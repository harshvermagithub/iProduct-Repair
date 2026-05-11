'use client';
import { useState } from 'react';
import { Settings, X, ShieldAlert } from 'lucide-react';
import PincodeInput from './PincodeInput';
import { updateCityPincodes, toggleCityActive, updatePartnerPincodes } from '@/app/admin/cities/actions';

export default function CityCard({ city, partners, zonalHeads, isZonalHead }: any) {
    const [showSettings, setShowSettings] = useState(false);
    const [selectedPartnerId, setSelectedPartnerId] = useState(partners?.[0]?.id || '');

    return (
        <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col gap-6 relative">
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h3 className="text-2xl font-black tracking-tighter">{city.name}</h3>
                    <div className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mt-1">Operational Territory</div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${city.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {city.isActive ? 'Live' : 'Inactive'}
                    </span>
                    <button 
                        onClick={() => setShowSettings(true)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        title="Manage Master Pincodes"
                    >
                        <Settings className="w-5 h-5 text-slate-500 hover:text-slate-900" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Hierarchy Info */}
                <div className="space-y-6">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Zonal Presence</h4>
                        {zonalHeads.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {zonalHeads.map((zh: any) => (
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
                                {partners.map((p: any) => (
                                    <div key={p.id} className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">{p.name}</div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-[11px] text-muted-foreground italic">No Partners</div>
                        )}
                    </div>
                </div>

                {/* Partner Service Areas Assignment */}
                <div className="bg-muted/30 p-5 rounded-2xl border border-muted-foreground/5 h-full">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Assign Partner Service Areas</h4>
                    {partners.length > 0 ? (
                        <form action={async (data) => {
                            const pincodesStr = data.get('pincodes') as string;
                            const pincodes = pincodesStr ? pincodesStr.split(',').map(p => p.trim()).filter(Boolean) : [];
                            await updatePartnerPincodes(selectedPartnerId, pincodes);
                            alert('Partner service areas updated!');
                        }} className="flex flex-col h-full gap-4">
                            <select 
                                value={selectedPartnerId} 
                                onChange={(e) => setSelectedPartnerId(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border text-sm outline-none focus:border-primary bg-background"
                            >
                                {partners.map((p: any) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            
                            {selectedPartnerId && (
                                <PincodeInput 
                                    // Use a key to force re-render when partner changes so initialPincodes updates
                                    key={selectedPartnerId}
                                    initialPincodes={partners.find((p: any) => p.id === selectedPartnerId)?.pincodes || []} 
                                    masterPincodes={city.pincodes || []} 
                                />
                            )}

                            <div className="mt-auto pt-4">
                                <button type="submit" className="w-full h-9 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-95 shadow-sm">
                                    Assign to Partner
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-sm text-muted-foreground italic flex items-center justify-center h-full pb-8">
                            Add a local partner to assign service areas.
                        </div>
                    )}
                </div>
            </div>

            {!isZonalHead && (
                <div className="pt-4 border-t flex justify-between items-center">
                    <div className="text-[10px] text-slate-400 font-medium italic">Safety Lock Enabled</div>
                    <button 
                        onClick={async () => {
                            await toggleCityActive(city.id, !city.isActive);
                        }} 
                        className="text-[10px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors"
                    >
                        Toggle Visibility
                    </button>
                </div>
            )}

            {/* City Master Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b flex justify-between items-center bg-muted/30">
                            <div>
                                <h3 className="text-xl font-black">City Settings</h3>
                                <p className="text-xs text-muted-foreground font-medium mt-1">Manage master pincode directory for {city.name}</p>
                            </div>
                            <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors dark:hover:bg-slate-800">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-xl p-4 flex gap-3 mb-6 dark:bg-orange-900/20 dark:border-orange-800/30 dark:text-orange-400">
                                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-xs font-medium leading-relaxed">
                                    Pincodes added here become the master list of serviceable areas for the entire city. Partners can only be assigned pincodes that exist in this master list.
                                </p>
                            </div>

                            <form action={async (data) => {
                                const pincodesStr = data.get('pincodes') as string;
                                const pincodes = pincodesStr ? pincodesStr.split(',').map(p => p.trim()).filter(Boolean) : [];
                                await updateCityPincodes(city.id, pincodes);
                                setShowSettings(false);
                            }} className="flex flex-col gap-6">
                                <PincodeInput initialPincodes={city.pincodes || []} cityName={city.name} />
                                
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button type="button" onClick={() => setShowSettings(false)} className="px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted rounded-xl transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-sm dark:bg-white dark:text-black dark:hover:bg-gray-200">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
