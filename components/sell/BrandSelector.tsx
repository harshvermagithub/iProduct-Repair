
import { motion } from "framer-motion";
import Image from "next/image";
import { Brand } from "@/lib/store";

interface BrandSelectorProps {
    brands: Brand[];
    onSelect: (brand: Brand) => void;
    onBack?: () => void;
}

import { ArrowLeft } from "lucide-react";

export default function BrandSelector({ brands, onSelect, onBack }: BrandSelectorProps) {
    return (
        <div className="space-y-6 relative">
            <div className="flex items-center justify-center relative mb-6">
                {onBack && (
                    <button onClick={onBack} className="absolute left-0 p-2 hover:bg-accent rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                )}
                <h2 className="text-2xl font-bold text-center">Select your Brand</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {brands.map((brand, index) => (
                    <motion.button
                        key={brand.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onSelect(brand)}
                        className="flex flex-col items-center justify-center p-6 border rounded-xl bg-white text-black hover:border-primary hover:shadow-lg transition-all aspect-square group"
                    >
                        <div className={`relative mb-4 transition-all flex items-center justify-center ${brand.name === 'Apple' ? 'w-20 h-20 sm:w-28 sm:h-28' : 'w-24 h-24 sm:w-32 sm:h-32'}`}>
                            {brand.logo && (brand.logo.startsWith('/') || brand.logo.startsWith('http')) ? (
                                <Image src={brand.logo} alt={brand.name} fill className="object-contain" unoptimized />
                            ) : (
                                <span className="text-3xl font-bold text-gray-400">{brand.name[0]}</span>
                            )}
                        </div>
                        <span className="font-medium">{brand.name}</span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
