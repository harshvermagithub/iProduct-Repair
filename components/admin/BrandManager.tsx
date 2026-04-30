
'use client';

import { useState, useRef } from 'react';
import { addBrand, updateBrand, deleteBrand } from '@/actions/admin';
import { uploadImage } from '@/actions/upload';
import { Trash2, Plus, Loader2, Upload, Pencil, X, ArrowUp, ArrowDown } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Brand {
    id: string;
    name: string;
    logo: string;
    priority: number;
}

interface BrandManagerProps {
    initialBrands: Brand[];
    category?: string;
}

export default function BrandManager({ initialBrands, category }: BrandManagerProps) {
    const router = useRouter();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [logo, setLogo] = useState('');
    const [priority, setPriority] = useState(100);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !logo) return;

        setIsLoading(true);
        try {
            if (editingId) {
                // Update is usually global properties (name/logo). 
                // We might want to restrict this or allow it. 
                // For now, updating name/logo updates it everywhere.
                await updateBrand(editingId, name, logo, priority);
            } else {
                await addBrand(name, logo, category, priority);
            }
            resetForm();
            router.refresh();
        } catch {
            alert(editingId ? 'Failed to update brand' : 'Failed to add brand');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (brand: Brand) => {
        setEditingId(brand.id);
        setName(brand.name);
        setLogo(brand.logo);
        setPriority(brand.priority || 100);
    };

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setLogo('');
        setPriority(100);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will remove the brand from this category.')) return;
        try {
            await deleteBrand(id, category);
            router.refresh();
        } catch {
            alert('Failed to delete brand');
        }
    };

    const moveBrand = async (index: number, direction: 'up' | 'down') => {
        if (isLoading) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === initialBrands.length - 1) return;

        const current = initialBrands[index];
        const swapWith = initialBrands[direction === 'up' ? index - 1 : index + 1];

        setIsLoading(true);
        try {
            // Swap priorities
            let p1 = swapWith.priority; // P of target becomes P of current
            let p2 = current.priority;  // P of current becomes P of target

            // Handle collision or equality: ensuring we actually move
            if (p1 === p2) {
                if (direction === 'up') p1 -= 1; // Move current UP (lower number)
                else p1 += 1; // Move current DOWN (higher number)
            }

            // Update both
            await updateBrand(current.id, current.name, current.logo, p1);
            await updateBrand(swapWith.id, swapWith.name, swapWith.logo, p2);

            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to reorder');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert('File size too large. Max 2MB.');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const url = await uploadImage(formData);
            setLogo(url);
        } catch (error) {
            alert('Failed to upload image');
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-card border rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">{editingId ? 'Edit Brand' : 'Add New Brand'}</h3>
                    {editingId && (
                        <button onClick={resetForm} className="text-sm text-red-500 flex items-center gap-1 hover:underline">
                            <X className="w-4 h-4" /> Cancel Edit
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
                    <div className="w-24 space-y-2">
                        <label className="text-sm font-medium">Priority</label>
                        <input
                            type="number"
                            value={priority}
                            onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                            className="w-full p-2 border rounded-lg bg-background"
                            placeholder="100"
                        />
                    </div>
                    <div className="flex-1 min-w-[200px] space-y-2">
                        <label className="text-sm font-medium">Brand Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded-lg bg-background"
                            placeholder="e.g. Nokia"
                        />
                    </div>
                    <div className="flex-1 min-w-[300px] space-y-2">
                        <label className="text-sm font-medium">Logo URL (SVG/PNG)</label>
                        <div className="flex gap-2">
                            <input
                                value={logo}
                                onChange={(e) => setLogo(e.target.value)}
                                className="w-full p-2 border rounded-lg bg-background"
                                placeholder="URL or Upload"
                            />
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/png, image/jpeg, image/svg+xml"
                                onChange={handleFileChange}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="p-2 border rounded-lg hover:bg-muted transition-colors"
                                title="Upload Image"
                            >
                                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <button
                        disabled={isLoading || isUploading}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 h-[42px] flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : (editingId ? 'Update' : <Plus className="w-5 h-5" />)}
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {initialBrands.map((brand, index) => (
                    <div key={brand.id} className="p-4 border rounded-xl flex items-center justify-between bg-card">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-1 mr-2">
                                <button
                                    onClick={() => moveBrand(index, 'up')}
                                    disabled={index === 0 || isLoading}
                                    className="p-1 hover:bg-muted rounded-full disabled:opacity-20 transition-colors"
                                    title="Move Up"
                                >
                                    <ArrowUp className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => moveBrand(index, 'down')}
                                    disabled={index === initialBrands.length - 1 || isLoading}
                                    className="p-1 hover:bg-muted rounded-full disabled:opacity-20 transition-colors"
                                    title="Move Down"
                                >
                                    <ArrowDown className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="w-12 h-12 relative bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 rounded-lg p-2 flex items-center justify-center overflow-hidden">
                                {brand.logo && (brand.logo.startsWith('/') || brand.logo.startsWith('http')) ? (
                                    <Image
                                        src={brand.logo}
                                        alt={brand.name}
                                        fill
                                        sizes="48px"
                                        unoptimized
                                        className="object-contain"
                                    />
                                ) : (
                                    <span className="text-xl font-bold text-gray-400">{brand.name[0]}</span>
                                )}
                            </div>
                            <span className="font-bold">{brand.name}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(brand)}
                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                title="Edit"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(brand.id)}
                                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
