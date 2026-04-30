'use client';

import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { ArrowLeft, Smartphone } from "lucide-react";
import { Variant } from '@/lib/store';
import { fetchVariants } from '@/actions/catalog';
import SVGLoader from "@/components/ui/SVGLoader";

interface VariantSelectorProps {
    modelId: string;
    category?: string;
    brand?: { name: string } | null;
    onSelect: (variant: Variant) => void;
    onAutoSkip?: (variant: Variant) => void;
    onBack: () => void;
}

export default function VariantSelector({ modelId, category, brand, onSelect, onAutoSkip, onBack }: VariantSelectorProps) {
    const [variants, setVariants] = useState<Variant[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                // Pass category to fetchVariants if provided
                const v = await fetchVariants(modelId, category);
                if (mounted) {
                    if (v.length === 1 && onAutoSkip) {
                        onAutoSkip(v[0]);
                    } else {
                        setVariants(v);
                        setIsLoading(false);
                    }
                }
            } catch (error) {
                console.error(error);
                if (mounted) setIsLoading(false);
            }
        }
        load();

        return () => { mounted = false; };
    }, [modelId, category]);

    const formatVariantName = (name: string) => {
        // If Apple, assume variants are like "4GB / 64GB" or "4 GB / 64 GB" and keep only the storage part
        if (brand?.name?.toLowerCase() === 'apple') {
            // Match any digits + space + GB/TB followed by a slash or dash, and capture everything after
            const match = name.match(/[\/\-]\s*(.*)$/);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        return name;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 hover:bg-accent rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold">Select Variant</h2>
            </div>

            {isLoading ? (
                <div className="min-h-[300px] flex items-center justify-center">
                    <SVGLoader className="bg-transparent backdrop-blur-none w-full" />
                </div>
            ) : variants.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    No variants found.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {variants.map((variant, index) => (
                        <motion.button
                            key={variant.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => onSelect(variant)}
                            className="flex items-center gap-4 p-6 border rounded-xl bg-card hover:border-primary hover:bg-primary/5 transition-all group"
                        >
                            <div className="p-3 bg-accent rounded-full group-hover:bg-primary/20 transition-colors">
                                <Smartphone className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <span className="font-semibold text-lg">{formatVariantName(variant.name)}</span>
                        </motion.button>
                    ))}
                </div>
            )}
        </div>
    );
}
