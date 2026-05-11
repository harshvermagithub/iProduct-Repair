'use client';
import { useState } from 'react';
import { Download, Plus, X } from 'lucide-react';

export default function PincodeInput({ initialPincodes, cityName, masterPincodes }: { initialPincodes: string[], cityName?: string, masterPincodes?: string[] }) {
    const [pincodes, setPincodes] = useState<string[]>(initialPincodes);
    const [input, setInput] = useState('');
    const [isLoadingAll, setIsLoadingAll] = useState(false);

    const handleAdd = (e?: React.MouseEvent | React.KeyboardEvent) => {
        if (e && 'key' in e && e.key !== 'Enter') return;
        if (e) e.preventDefault();

        const code = input.trim();
        // Validate exactly 6 digit Indian pincode
        if (!/^\d{6}$/.test(code)) {
            alert('Please enter a valid 6-digit pincode.');
            return;
        }

        if (masterPincodes && !masterPincodes.includes(code)) {
            alert('This pincode is not registered in the City master list.');
            return;
        }

        if (code && !pincodes.includes(code)) {
            setPincodes([...pincodes, code]);
            setInput('');
        }
    };

    const handleRemove = (code: string) => {
        setPincodes(pincodes.filter(c => c !== code));
    };

    const handleAddAll = async () => {
        if (masterPincodes) {
            // Assign all master pincodes
            const merged = Array.from(new Set([...pincodes, ...masterPincodes]));
            setPincodes(merged);
            return;
        }

        if (!cityName) return;
        setIsLoadingAll(true);
        try {
            const response = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(cityName)}`);
            const data = await response.json();
            if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice) {
                const newPincodes = data[0].PostOffice.map((po: any) => po.Pincode);
                const uniqueNewPincodes = Array.from(new Set<string>(newPincodes));
                const validPincodes = uniqueNewPincodes.filter(p => /^\d{6}$/.test(p));
                
                if (validPincodes.length > 0) {
                    const merged = Array.from(new Set([...pincodes, ...validPincodes]));
                    setPincodes(merged);
                } else {
                    alert(`No valid pincodes found for ${cityName}.`);
                }
            } else {
                alert(`Could not fetch pincodes for ${cityName}.`);
            }
        } catch (e) {
            alert('Error fetching pincodes. Please try again.');
        } finally {
            setIsLoadingAll(false);
        }
    };

    return (
        <div className="flex flex-col gap-2 w-full flex-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned Pincodes</label>
            <input type="hidden" name="pincodes" value={pincodes.join(',')} />

            <div className="flex flex-wrap gap-2">
                {pincodes.map(p => (
                    <div key={p} className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-sm font-medium px-2 py-1 rounded-full">
                        <span>{p}</span>
                        <button type="button" onClick={() => handleRemove(p)} className="hover:text-red-500 rounded-full p-0.5 transition-colors">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 w-full mt-1">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleAdd}
                    placeholder="Enter pincode (e.g. 560032)"
                    className="flex-1 min-w-0 h-9 px-3 rounded-md border text-sm outline-none focus:border-primary bg-background"
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    className="shrink-0 h-9 px-3 bg-secondary text-secondary-foreground rounded-md text-xs font-medium hover:bg-secondary/80 flex items-center gap-1"
                >
                    <Plus className="w-3 h-3" /> Add
                </button>
                {(cityName || masterPincodes) && (
                    <button
                        type="button"
                        onClick={handleAddAll}
                        disabled={isLoadingAll}
                        className="shrink-0 h-9 px-3 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md text-xs font-medium hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                        title={masterPincodes ? "Assign all city pincodes" : `Fetch and add all pincodes for ${cityName}`}
                    >
                        {isLoadingAll ? (
                            <div className="w-3 h-3 rounded-full border-2 border-emerald-800 border-t-transparent animate-spin" />
                        ) : (
                            <Download className="w-3 h-3" />
                        )}
                        Add All
                    </button>
                )}
            </div>
        </div>
    );
}
