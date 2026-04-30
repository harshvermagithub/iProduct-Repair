
'use client';

import { useState } from 'react';
import { addVariant, updateVariant, deleteVariant } from '@/actions/admin';
import { Trash2, Plus, Loader2, Pencil, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Brand {
    id: string;
    name: string;
}

interface Model {
    id: string;
    brandId: string;
    name: string;
    category?: string;
}

interface Variant {
    id: string;
    modelId: string;
    name: string;
    basePrice: number;
}

const CATEGORIES = [
    { id: 'smartphone', label: 'Smartphone' },
    { id: 'tablet', label: 'Tablet' },
    { id: 'smartwatch', label: 'Smartwatch' },
    { id: 'laptop', label: 'Laptop' },
    { id: 'console', label: 'Gaming Console' },
    { id: 'tv', label: 'Smart TV' },
    { id: 'repair-device', label: 'Repair Device' },
];

export default function VariantManager({
    initialVariants,
    brands,
    models,
    preselectedCategory
}: {
    initialVariants: Variant[],
    brands: Brand[],
    models: Model[],
    preselectedCategory?: string
}) {
    const router = useRouter();
    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState(preselectedCategory || 'smartphone');
    const [selectedBrand, setSelectedBrand] = useState(brands[0]?.id || '');
    const [selectedModel, setSelectedModel] = useState('');

    // Filter available models based on Category AND Brand
    const availableModels = models.filter(m =>
        m.brandId === selectedBrand &&
        (m.category || 'smartphone') === selectedCategory
    );

    // Auto-select first available model when brand/category changes
    if (selectedBrand && availableModels.length > 0 && !availableModels.find(m => m.id === selectedModel)) {
        // We use a small timeout or just direct set (render loop risk, but simplified here)
        // Better: useEffect to sync selectedModel. But adhering to existing pattern:
        // Checking if we are currently rendering a state mismatch is tricky. 
        // Ideally user selects model. I'll default to empty string to force selection.
    }

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // List Filter State
    const [filterCategory, setFilterCategory] = useState(preselectedCategory || 'smartphone');
    const [filterBrand, setFilterBrand] = useState('all');
    const [filterModel, setFilterModel] = useState('all');

    // Filter models for the "List View" dropdowns
    const filteredModelsList = models.filter(m => {
        if (filterCategory !== 'all' && (m.category || 'smartphone') !== filterCategory) return false;
        if (filterBrand !== 'all' && m.brandId !== filterBrand) return false;
        return true;
    });

    const visibleVariants = initialVariants.filter(v => {
        const model = models.find(m => m.id === v.modelId);
        if (!model) return false; // Orphan variant

        // Filter by Category
        if (filterCategory !== 'all' && (model.category || 'smartphone') !== filterCategory) return false;

        // Filter by Brand
        if (filterBrand !== 'all' && model.brandId !== filterBrand) return false;

        // Filter by Model
        if (filterModel !== 'all' && v.modelId !== filterModel) return false;

        return true;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedModel || !name || !price) return;

        setIsLoading(true);
        try {
            if (editingId) {
                await updateVariant(editingId, selectedModel, name, Number(price));
            } else {
                await addVariant(selectedModel, name, Number(price));
            }
            resetForm();
            router.refresh();
        } catch {
            alert(editingId ? 'Failed to update variant' : 'Failed to add variant');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (variant: Variant) => {
        const model = models.find(m => m.id === variant.modelId);
        if (model) {
            setEditingId(variant.id);
            setEditingId(variant.id);
            // Derive category from model
            setSelectedCategory(model.category || 'smartphone');
            setSelectedBrand(model.brandId);
            setSelectedModel(variant.modelId);
            setName(variant.name);
            setPrice(variant.basePrice.toString());
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setPrice('');
        if (preselectedCategory) setSelectedCategory(preselectedCategory);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await deleteVariant(id);
            router.refresh();
        } catch {
            alert('Failed to delete variant');
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-card border rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">{editingId ? 'Edit Variant' : `Add ${CATEGORIES.find(c => c.id === selectedCategory)?.label} Variant`}</h3>
                    {editingId && (
                        <button onClick={resetForm} className="text-sm text-red-500 flex items-center gap-1 hover:underline">
                            <X className="w-4 h-4" /> Cancel Edit
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    {!preselectedCategory && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setSelectedModel('');
                                }}
                                className="w-full p-2 border rounded-lg bg-background"
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c.id} value={c.id}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Brand</label>
                        <select
                            value={selectedBrand}
                            onChange={(e) => {
                                setSelectedBrand(e.target.value);
                                setSelectedModel(''); // Reset model
                            }}
                            className="w-full p-2 border rounded-lg bg-background"
                        >
                            {brands.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Model</label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full p-2 border rounded-lg bg-background"
                        >
                            <option value="">Select Model</option>
                            {availableModels.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Variant Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded-lg bg-background"
                            placeholder="e.g. 8GB/128GB"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Base Price (₹)</label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full p-2 border rounded-lg bg-background"
                            placeholder="e.g. 15000"
                        />
                    </div>
                    <button
                        disabled={isLoading || !selectedModel}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 flex justify-center h-[42px] items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : (editingId ? 'Update' : <Plus className="w-5 h-5" />)}
                    </button>
                </form>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <h3 className="text-xl font-bold">{CATEGORIES.find(c => c.id === filterCategory)?.label || 'All'} Variants</h3>
                    <div className="flex gap-2 flex-wrap">
                        {/* Category Filter Tabs or Select */}
                        {!preselectedCategory && (
                            <select
                                value={filterCategory}
                                onChange={(e) => {
                                    setFilterCategory(e.target.value);
                                    setFilterBrand('all');
                                    setFilterModel('all');
                                }}
                                className="p-2 border rounded-lg bg-background"
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c.id} value={c.id}>{c.label}</option>
                                ))}
                            </select>
                        )}

                        <select
                            value={filterBrand}
                            onChange={(e) => {
                                setFilterBrand(e.target.value);
                                setFilterModel('all');
                            }}
                            className="p-2 border rounded-lg bg-background"
                        >
                            <option value="all">All Brands</option>
                            {brands.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                        <select
                            value={filterModel}
                            onChange={(e) => setFilterModel(e.target.value)}
                            className="p-2 border rounded-lg bg-background max-w-[200px]"
                        >
                            <option value="all">All Models</option>
                            {filteredModelsList.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-card border rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 border-b text-xs uppercase tracking-wider text-muted-foreground">
                            <tr>
                                <th className="p-4 font-medium">Model Info</th>
                                <th className="p-4 font-medium">Variant Spec</th>
                                <th className="p-4 font-medium text-right">Base Price</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {visibleVariants.map((variant) => {
                                const model = models.find(m => m.id === variant.modelId);
                                const brand = brands.find(b => b.id === model?.brandId);
                                return (
                                    <tr key={variant.id} className="hover:bg-muted/10">
                                        <td className="p-4">
                                            {model ? (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold">{model.name}</span>
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">{model.category || 'smartphone'}</span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground block">{brand?.name || 'Unknown Brand'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="font-bold text-destructive">Unknown Model ({variant.modelId})</span>
                                                    <span className="text-xs text-muted-foreground block">-</span>
                                                </>
                                            )}
                                        </td>
                                        <td className="p-4 font-medium">{variant.name}</td>
                                        <td className="p-4 font-mono font-bold text-right">₹{variant.basePrice.toLocaleString()}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(variant)}
                                                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors inline-block"
                                                    title="Edit Variant"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(variant.id)}
                                                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors inline-block"
                                                    title="Delete Variant"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {visibleVariants.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                        No variants found using the current filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
