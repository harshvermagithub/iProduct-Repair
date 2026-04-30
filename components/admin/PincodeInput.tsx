'use client';
import { useState } from 'react';
import { X, Plus } from 'lucide-react';

export default function PincodeInput({ initialPincodes }: { initialPincodes: string[] }) {
    const [pincodes, setPincodes] = useState<string[]>(initialPincodes);
    const [input, setInput] = useState('');

    const handleAdd = (e?: React.MouseEvent | React.KeyboardEvent) => {
        if (e && 'key' in e && e.key !== 'Enter') return;
        if (e) e.preventDefault();

        const code = input.trim();
        // Validate exactly 6 digit Indian pincode
        if (!/^\d{6}$/.test(code)) {
            alert('Please enter a valid 6-digit pincode.');
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
            </div>
        </div>
    );
}
