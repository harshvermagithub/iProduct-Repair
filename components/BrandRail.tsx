'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchBrands } from '@/actions/catalog';
import { ArrowRight, Smartphone, Tablet, Laptop, Watch, Gamepad2, Wrench, X, Tv } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Brand } from '@/lib/store';

const CATEGORY_OPTIONS = [
    { id: 'smartphone', label: 'Phone', icon: Smartphone, color: 'text-blue-500' },
    { id: 'laptop', label: 'Laptop', icon: Laptop, color: 'text-purple-500' },
    { id: 'tablet', label: 'Tablet', icon: Tablet, color: 'text-pink-500' },
    { id: 'smartwatch', label: 'Watch', icon: Watch, color: 'text-orange-500' },
    { id: 'console', label: 'Console', icon: Gamepad2, color: 'text-indigo-500' },
    { id: 'smarttv', label: 'TV', icon: Tv, color: 'text-red-500' },
];

const getBrandCategories = (brandName: string) => {
    const b = brandName.toLowerCase();
    const cats = ['smartphone'];

    // Tablets
    if (['apple', 'samsung', 'xiaomi', 'oneplus', 'lenovo', 'motorola', 'realme', 'google', 'honor', 'huawei', 'oppo', 'vivo'].includes(b)) {
        cats.push('tablet');
    }

    // Laptops
    if (['apple', 'samsung', 'xiaomi', 'lenovo', 'asus', 'hp', 'dell', 'acer', 'msi', 'microsoft', 'honor'].includes(b)) {
        cats.push('laptop');
    }

    // Watches
    if (['apple', 'samsung', 'xiaomi', 'oneplus', 'google', 'huawei', 'honor', 'motorola', 'noise', 'boat', 'fire-boltt'].includes(b)) {
        cats.push('smartwatch');
    }

    // Consoles
    if (['sony', 'microsoft', 'nintendo'].includes(b)) {
        cats.push('console');
    }

    // Smart TVs
    if (['samsung', 'sony', 'lg', 'xiaomi', 'oneplus', 'motorola', 'nokia', 'acer', 'tcl'].includes(b)) {
        cats.push('smarttv');
    }

    return cats;
};

export function BrandRail({ initialBrands }: { initialBrands?: Brand[] }) {
    const [brands, setBrands] = useState<Brand[]>(initialBrands || []);
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

    useEffect(() => {
        if (!initialBrands || initialBrands.length === 0) {
            fetchBrands('smartphone').then(setBrands);
        }
    }, [initialBrands]);

    if (brands.length === 0) return null;

    return (
        <>
            <div className="w-full space-y-3">
                <div className="flex items-center justify-between px-1">
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Top Brands</span>
                    <Link href="/sell" className="text-xs font-medium text-green-500 flex items-center gap-1">
                        View All <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 min-[340px]:grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 gap-4 pb-4 px-1">
                    {brands.slice(0, 8).map((brand, i) => (
                        <button
                            key={brand.id}
                            onClick={() => setSelectedBrand(brand)}
                            className="flex flex-col items-center gap-2 w-full group focus:outline-none"
                        >
                            <div className="w-full aspect-square max-w-[90px] rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center shadow-sm group-hover:border-green-500 transition-colors p-3">
                                <div className="relative w-full h-full">
                                    {brand.logo ? (
                                        <Image src={brand.logo} alt={brand.name} fill className="object-contain" unoptimized />
                                    ) : (
                                        <Smartphone className="w-8 h-8 text-slate-400" />
                                    )}
                                </div>
                            </div>
                            <span className="text-sm font-bold text-center truncate w-full group-hover:text-green-500 transition-colors">
                                {brand.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Brand Category Selection Modal */}
            {typeof window !== "undefined" && createPortal(
                <AnimatePresence>
                    {selectedBrand && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 w-screen h-screen">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedBrand(null)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="relative w-full max-w-sm bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 relative p-1 bg-white border border-slate-100 rounded-xl flex items-center justify-center">
                                            {selectedBrand.logo ? (
                                                <Image src={selectedBrand.logo} alt={selectedBrand.name} fill className="object-contain p-1" unoptimized />
                                            ) : (
                                                <Smartphone className="w-8 h-8 text-slate-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-black">Select Category</h3>
                                            <p className="text-sm text-slate-500 font-medium">For {selectedBrand.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedBrand(null)}
                                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-slate-500" />
                                    </button>
                                </div>

                                <div className="p-6 grid grid-cols-3 gap-4">
                                    {CATEGORY_OPTIONS.filter(opt => getBrandCategories(selectedBrand.name).includes(opt.id)).map((option) => (
                                        <Link
                                            key={option.id}
                                            href={`/sell?category=${option.id}&brandId=${selectedBrand.id}`}
                                            className="flex flex-col items-center gap-2 group"
                                            onClick={() => setSelectedBrand(null)}
                                        >
                                            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-all group-hover:scale-105 shadow-sm bg-white border-2 border-slate-100 ${option.color}`}>
                                                <option.icon className="w-14 h-14" />
                                            </div>
                                            <span className="text-sm font-bold text-black group-hover:text-primary transition-colors">
                                                {option.label}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
