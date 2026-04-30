'use client';

import { useState, useRef, useEffect } from 'react';
import { addModel, updateModel, deleteModel, reorderModels, addVariant, updateVariant, deleteVariant } from '@/actions/admin';
import { uploadImage } from '@/actions/upload';
import { Trash2, Plus, Loader2, Upload, Pencil, X, GripVertical, Check, ImageIcon, Ban, Search, ChevronDown } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Variant } from '@/lib/store';

interface Brand {
    id: string;
    name: string;
}

interface Model {
    id: string;
    brandId: string;
    name: string;
    img: string;
    category?: string;
    priority?: number;
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

function SortableModel({ model, brands, variants, onEdit, onDelete }: { model: Model, brands: Brand[], variants: Variant[], onEdit: (m: Model) => void, onDelete: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: model.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const modelVariants = variants.filter(v => v.modelId === model.id);
    const minPrice = modelVariants.length > 0 ? Math.min(...modelVariants.map(v => v.basePrice)) : 0;

    return (
        <div ref={setNodeRef} style={style} className="group relative bg-card hover:bg-accent/5 rounded-xl border transition-all duration-200 hover:shadow-lg flex flex-col overflow-hidden">
            {/* Action Overlay (Desktop) */}
            <div className="absolute inset-x-0 top-0 h-full bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none md:block hidden" />

            <div className="p-4 flex items-start gap-4">
                {/* Drag Handle */}
                <div {...attributes} {...listeners} className="mt-1 text-muted-foreground/50 hover:text-foreground cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-5 h-5" />
                </div>

                {/* Image */}
                <div className="relative w-16 h-16 shrink-0 rounded-lg border bg-white flex items-center justify-center overflow-hidden">
                    {model.img && (model.img.startsWith('/') || model.img.startsWith('http')) ? (
                        <Image src={model.img.split('?')[0]} alt={model.name} fill className="object-contain p-1" />
                    ) : (
                        <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <div>
                            <h4 className="font-semibold text-foreground truncate pr-2">{model.name}</h4>
                            <p className="text-xs text-muted-foreground">{brands.find(b => b.id === model.brandId)?.name}</p>
                        </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                        {modelVariants.length > 0 ? (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-medium">
                                <Check className="w-3 h-3" />
                                <span>{modelVariants.length} Variants</span>
                                <span className="opacity-60">|</span>
                                <span>From ₹{minPrice.toLocaleString()}</span>
                            </div>
                        ) : (
                            <div className="inline-flex px-2 py-1 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 text-xs font-medium">
                                No Variants
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions Footer - Improved spacing */}
            <div className="mt-auto px-4 py-3 border-t bg-muted/20 flex justify-end gap-3 relative z-10">
                <button
                    onClick={() => onEdit(model)}
                    className="h-9 px-4 text-xs font-medium rounded-lg bg-background border hover:bg-accent transition-colors flex items-center gap-2 hover:border-primary/50 shadow-sm"
                >
                    <Pencil className="w-3.5 h-3.5 text-primary" /> Edit
                </button>
                <button
                    onClick={() => onDelete(model.id)}
                    className="h-9 w-9 flex items-center justify-center rounded-lg bg-background border hover:bg-destructive/10 hover:border-destructive/50 transition-colors text-destructive shadow-sm"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

// Local Variant Type for Form
type FormVariant = {
    id: string;
    name: string;
    basePrice: number;
    isNew?: boolean;
    isDeleted?: boolean;
}

export default function ModelManager({ initialModels, initialVariants = [], brands, preselectedCategory }: { initialModels: Model[], initialVariants?: Variant[], brands: Brand[], preselectedCategory?: string }) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [brandId, setBrandId] = useState(brands[0]?.id || '');
    const [name, setName] = useState('');
    const [img, setImg] = useState('');
    const [category, setCategory] = useState(preselectedCategory || 'smartphone');

    // Variants Form State
    const [formVariants, setFormVariants] = useState<FormVariant[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter / Sort State
    const [searchQuery, setSearchQuery] = useState('');
    const [models, setModels] = useState(initialModels);

    useEffect(() => {
        const sorted = [...initialModels].sort((a, b) => (a.priority || 100) - (b.priority || 100));
        setModels(sorted);
    }, [initialModels]);

    const visibleModels = models.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = models.findIndex((item) => item.id === active.id);
            const newIndex = models.findIndex((item) => item.id === over.id);
            const newItems = arrayMove(models, oldIndex, newIndex);

            setModels(newItems);

            const updates = newItems.map((model, index) => ({ id: model.id, priority: index + 1 }));
            await reorderModels(updates);
        }
    };

    const handleEdit = (model: Model) => {
        setEditingId(model.id);
        setBrandId(model.brandId);
        setName(model.name);
        setImg(model.img);
        setCategory(model.category || 'smartphone');

        // Load variants for this model
        const existingVariants = initialVariants
            .filter(v => v.modelId === model.id)
            .map(v => ({ id: v.id, name: v.name, basePrice: v.basePrice }));
        setFormVariants(existingVariants);

        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setBrandId(brands[0]?.id || '');
        setName('');
        setImg('');
        if (preselectedCategory) setCategory(preselectedCategory);
        setFormVariants([]);
        setIsDialogOpen(false);
    };

    const addFormVariant = () => {
        setFormVariants([...formVariants, {
            id: `temp-${Math.random()}`,
            name: '',
            basePrice: 0,
            isNew: true
        }]);
    };

    const updateFormVariant = (index: number, field: keyof FormVariant, value: any) => {
        const newVariants = [...formVariants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setFormVariants(newVariants);
    };

    const removeFormVariant = (index: number) => {
        const newVariants = [...formVariants];
        if (newVariants[index].isNew) {
            newVariants.splice(index, 1);
        } else {
            newVariants[index].isDeleted = true;
        }
        setFormVariants(newVariants);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!brandId || !name || !img) return;

        setIsLoading(true);
        try {
            let targetModelId = editingId;
            if (editingId) {
                await updateModel(editingId, brandId, name, img, category);
            } else {
                const res = await addModel(brandId, name, img, category);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                targetModelId = (res as any).id;
            }

            if (targetModelId) {
                const toDelete = formVariants.filter(v => v.isDeleted && !v.isNew);
                for (const v of toDelete) await deleteVariant(v.id);

                const activeVariants = formVariants.filter(v => !v.isDeleted);
                for (const v of activeVariants) {
                    if (v.isNew) await addVariant(targetModelId, v.name, Number(v.basePrice));
                    else await updateVariant(v.id, targetModelId, v.name, Number(v.basePrice));
                }
            }
            resetForm();
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to save. Check console.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) return alert('Max 2MB');
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const url = await uploadImage(formData);
            setImg(url);
        } catch { alert('Upload failed'); } finally { setIsUploading(false); }
    };

    // Calculate dynamic stats for the modal header
    const activeVariantCount = formVariants.filter(v => !v.isDeleted).length;

    // Helper for Select to match Input Height perfectly with custom Chevron
    const SelectWrapper = ({ children }: { children: React.ReactNode }) => (
        <div className="relative w-full">
            {children}
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header / Search Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative w-full md:max-w-md group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        placeholder="Search models..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10 h-11 w-full border rounded-full bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"><X className="w-4 h-4" /></button>
                    )}
                </div>
                <button
                    onClick={() => { resetForm(); setIsDialogOpen(true); }}
                    className="h-11 flex items-center gap-2 px-8 bg-foreground text-background rounded-full hover:opacity-90 transition-all shadow-lg hover:shadow-xl font-medium text-sm whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Model</span>
                </button>
            </div>

            {/* Model Grid */}
            <div className="space-y-4">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={visibleModels.map(m => m.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {visibleModels.map((model) => (
                                <SortableModel
                                    key={model.id}
                                    model={model}
                                    brands={brands}
                                    variants={initialVariants}
                                    onEdit={handleEdit}
                                    onDelete={async (id) => { if (confirm('Are you sure?')) { await deleteModel(id); router.refresh(); } }}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
                {visibleModels.length === 0 && <div className="text-center py-24 text-muted-foreground border-2 border-dashed rounded-2xl bg-muted/5 flex flex-col items-center justify-center gap-2">
                    <Search className="w-8 h-8 opacity-20" />
                    <span>No models match your search.</span>
                </div>}
            </div>

            {/* Edit/Add Modal */}
            {isDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-background w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-8 py-5 border-b bg-muted/30 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-xl font-bold tracking-tight">{editingId ? 'Edit Model' : 'Create New Model'}</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">Manage details and variant pricing</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                    {activeVariantCount} Variants
                                </div>
                                <button onClick={resetForm} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto p-8 flex-1 bg-muted/5">
                            <form id="model-form" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    {/* Left Column: Basic Info */}
                                    <div className="lg:col-span-5 space-y-8">
                                        <section className="space-y-5">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-blue-500" /> Basic Details
                                            </h4>

                                            <div className="space-y-5">
                                                {/* Consistent Height & Spacing */}
                                                {!preselectedCategory && (
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Device Type</label>
                                                        <SelectWrapper>
                                                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-11 px-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer hover:border-primary/50">
                                                                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                                            </select>
                                                        </SelectWrapper>
                                                    </div>
                                                )}

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Brand</label>
                                                    <SelectWrapper>
                                                        <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className="w-full h-11 px-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none cursor-pointer hover:border-primary/50">
                                                            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                                        </select>
                                                    </SelectWrapper>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Model Name</label>
                                                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-11 px-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50 hover:border-primary/50" placeholder="e.g. iPhone 15 Pro" required />
                                                </div>
                                            </div>
                                        </section>

                                        <section className="space-y-5">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-purple-500" /> Visuals
                                            </h4>

                                            <div className="border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-4 bg-muted/10 hover:bg-muted/20 transition-colors group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                                {img ? (
                                                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border shadow-sm bg-white p-2">
                                                        <Image src={img.split('?')[0]} alt="Preview" fill className="object-contain" />
                                                        <button type="button" onClick={(e) => { e.stopPropagation(); setImg(''); }} className="absolute top-1 right-1 bg-black/50 hover:bg-destructive text-white p-1 rounded-full backdrop-blur-sm transition-colors"><X className="w-3 h-3" /></button>
                                                    </div>
                                                ) : (
                                                    <div className="text-center text-muted-foreground">
                                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                            <Upload className="w-5 h-5 opacity-50" />
                                                        </div>
                                                        <span className="text-sm font-medium text-foreground">Click to upload image</span>
                                                        <p className="text-xs opacity-60 mt-1">PNG, JPG up to 2MB</p>
                                                    </div>
                                                )}
                                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                            </div>
                                            <input value={img} onChange={(e) => setImg(e.target.value)} className="w-full p-2 rounded-lg border bg-background text-xs text-muted-foreground focus:text-foreground" placeholder="Or paste image URL..." />
                                        </section>
                                    </div>

                                    {/* Vertical Divider */}
                                    <div className="hidden lg:block w-px bg-border/50" />

                                    {/* Right Column: Variants */}
                                    <div className="lg:col-span-6 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Pricing & Variants
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={addFormVariant}
                                                className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors"
                                            >
                                                <Plus className="w-3 h-3" /> Add Variant
                                            </button>
                                        </div>

                                        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                                            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-bold text-muted-foreground border-b bg-muted/20">
                                                <div className="col-span-6">Variant Name</div>
                                                <div className="col-span-4">Base Price</div>
                                                <div className="col-span-2 text-right">Action</div>
                                            </div>

                                            <div className="flex-1 overflow-y-auto max-h-[400px] p-2 space-y-1">
                                                {formVariants.filter(v => !v.isDeleted).map((variant, idx) => (
                                                    <div key={variant.id || idx} className="grid grid-cols-12 gap-3 items-center p-2 rounded-lg hover:bg-muted/50 transition-colors group animate-in slide-in-from-right-2 duration-300">
                                                        <div className="col-span-6">
                                                            <input
                                                                value={variant.name}
                                                                onChange={(e) => updateFormVariant(idx, 'name', e.target.value)}
                                                                className="w-full h-10 px-3 border-0 bg-transparent font-medium focus:ring-0 placeholder:text-muted-foreground/30"
                                                                placeholder="e.g. 128GB"
                                                                autoFocus={variant.isNew && !variant.name}
                                                            />
                                                        </div>
                                                        <div className="col-span-4">
                                                            <div className="flex items-center border rounded-md overflow-hidden bg-background/50 focus-within:ring-2 ring-primary/20 focus-within:bg-background transition-all h-10">
                                                                <div className="px-3 py-2 bg-muted/50 text-muted-foreground text-xs font-medium border-r h-full flex items-center">₹</div>
                                                                <input
                                                                    type="number"
                                                                    value={variant.basePrice}
                                                                    onChange={(e) => updateFormVariant(idx, 'basePrice', e.target.value)}
                                                                    className="w-full p-2 border-0 outline-none bg-transparent text-sm font-mono h-full"
                                                                    placeholder="0"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-span-2 flex justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFormVariant(idx)}
                                                                className="p-2 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}

                                                {formVariants.filter(v => !v.isDeleted).length === 0 && (
                                                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                                                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                                                            <Ban className="w-5 h-5 opacity-30" />
                                                        </div>
                                                        <p className="text-sm font-medium">No variants configured</p>
                                                        <button type="button" onClick={addFormVariant} className="text-xs text-primary mt-2 hover:underline">Add default variant</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-5 border-t bg-background shrink-0 flex items-center justify-between">
                            <div className="text-xs text-muted-foreground hidden md:block">
                                <span className="font-semibold text-foreground">Tip:</span> Use drag & drop to reorder models in the list view.
                            </div>
                            <div className="flex gap-4 w-full md:w-auto justify-end">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-2.5 text-sm font-medium rounded-xl border hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="model-form"
                                    disabled={isLoading || isUploading}
                                    className="px-8 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingId ? 'Save Changes' : 'Create Model'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
