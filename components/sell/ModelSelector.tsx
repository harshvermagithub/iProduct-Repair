'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from "framer-motion";
import { ArrowLeft, Search, X } from "lucide-react";
import Image from "next/image";
import { Model } from '@/lib/store';
import { fetchModels } from '@/actions/catalog';
import SVGLoader from "@/components/ui/SVGLoader";

interface ModelSelectorProps {
    brandId: string;
    category?: string;
    originalCategory?: string;
    onSelect: (model: Model) => void;
    onBack: () => void;
}

const EXCLUDED_MODELS = new Set([
    "iPhone 17", "iPhone 17 Air",
    "iPhone 16 Plus", "iPhone 16", "iPhone 16e", "iPhone 16 E",
    "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15",
    "iPhone XS Max", "iPhone XS"
]);

// Helper Component for Image Fallback
const ModelImage = ({ src, alt, priority = false, scale = 1 }: { src: string, alt: string, priority?: boolean, scale?: number }) => {
    const [error, setError] = useState(false);

    const cleanSrc = useMemo(() => src ? src.split('?')[0] : '', [src]);

    // Validate URL format before rendering Next.js Image to prevent "Invalid URL" crash
    const isValid = useMemo(() => {
        if (!cleanSrc) return false;
        try {
            if (cleanSrc.startsWith('/') || cleanSrc.startsWith('data:')) return true;
            new URL(cleanSrc); // Check if valid absolute URL
            return true;
        } catch {
            return false;
        }
    }, [cleanSrc]);

    if (!isValid || error) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <span className="text-2xl font-bold text-gray-200">{alt.substring(0, 1)}</span>
            </div>
        );
    }

    return (
        <Image
            src={cleanSrc}
            alt={alt}
            fill
            priority={priority}
            className="object-contain p-1 transition-transform duration-300"
            style={{ transform: `scale(${scale})` }}
            sizes="(max-width: 768px) 50vw, 25vw"
            onError={() => setError(true)}
            unoptimized
        />
    );
};

export default function ModelSelector({ brandId, category, originalCategory, onSelect, onBack }: ModelSelectorProps) {
    const [models, setModels] = useState<Model[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSeries, setActiveSeries] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        setIsLoading(true);

        fetchModels(brandId, category)
            .then(data => {
                if (mounted) {
                    let processedData = data;
                    if (originalCategory === 'unbreakable-screenguard') {
                        processedData = data.filter(model => {
                            const name = model.name.toLowerCase();
                            if (name.includes('iphone')) {
                                return name.includes('iphone 15') || 
                                       name.includes('iphone 16') || 
                                       name.includes('iphone 17') ||
                                       name.includes('iphone 18');
                            }
                            if (name.includes('sams') || name.includes('galaxy')) {
                                return name.includes('s24') || name.includes('s25');
                            }
                            if (name.includes('oneplus')) {
                                return name.includes('oneplus 13') || name.includes('oneplus 15');
                            }
                            if (name.includes('pixel') || name.includes('google')) {
                                return name.includes('pixel 9') || name.includes('pixel 10');
                            }
                            return true;
                        });
                    }
                    setModels(processedData);
                    setIsLoading(false);
                }
            })
            .catch(err => {
                console.error("Failed to fetch models:", err);
                if (mounted) setIsLoading(false);
            });

        return () => { mounted = false; };
    }, [brandId, category]);

    // Extract Series Logic
    const seriesList = useMemo(() => {
        const uniqueSeries = new Set<string>();
        models.forEach(m => {
            const name = m.name;
            const lowerName = name.toLowerCase();

            // Tablet - Apple
            if (lowerName.includes('ipad')) {
                if (lowerName.includes('pro')) uniqueSeries.add('iPad Pro');
                else if (lowerName.includes('air')) uniqueSeries.add('iPad Air');
                else if (lowerName.includes('mini')) uniqueSeries.add('iPad mini');
                else uniqueSeries.add('iPad (Standard)');
            }
            // Tablet - Samsung
            else if (lowerName.includes('galaxy tab')) {
                if (lowerName.includes('tab s')) uniqueSeries.add('Galaxy Tab S');
                else if (lowerName.includes('tab a')) uniqueSeries.add('Galaxy Tab A');
                else uniqueSeries.add('Other Galaxy Tab');
            }
            // Tablet - OnePlus
            else if (lowerName.includes('oneplus pad')) {
                uniqueSeries.add('OnePlus Pad');
            }
            // Tablet - Realme
            else if (lowerName.includes('realme pad')) {
                uniqueSeries.add('Realme Pad');
            }
            // Tablet - Xiaomi / Poco / etc
            else if (lowerName.includes('xiaomi pad') || lowerName.includes('mi pad')) {
                uniqueSeries.add('Xiaomi Pad');
            }
            else if (lowerName.includes('redmi pad')) {
                uniqueSeries.add('Redmi Pad');
            }
            else if (lowerName.includes('oppo pad')) {
                uniqueSeries.add('Oppo Pad');
            }
            else if (lowerName.includes('poco pad')) {
                uniqueSeries.add('Poco Pad');
            }
            else if (lowerName.includes('lenovo tab')) {
                uniqueSeries.add('Lenovo Tab');
            }
            else if (lowerName.includes('yoga tab')) {
                uniqueSeries.add('Lenovo Yoga Tab');
            }
            else if (lowerName.includes('moto tab') || lowerName.includes('motorola tab')) {
                uniqueSeries.add('Moto Tab');
            }
            else if (lowerName.includes('nokia t')) {
                uniqueSeries.add('Nokia T Series');
            }

            // Smartphone - Samsung
            else if (name.includes('Galaxy S')) uniqueSeries.add('S Series');
            else if (name.includes('Galaxy A')) uniqueSeries.add('A Series');
            else if (name.includes('Galaxy M')) uniqueSeries.add('M Series');
            else if (name.includes('Galaxy F')) uniqueSeries.add('F Series');
            else if (name.includes('Galaxy Z Fold') || name.includes('Fold')) uniqueSeries.add('Z Fold Series');
            else if (name.includes('Galaxy Z Flip') || name.includes('Flip')) uniqueSeries.add('Z Flip Series');
            // Fallback for generic Z if any (though usually Fold/Flip)
            else if (name.includes('Galaxy Z')) uniqueSeries.add('Z Series');
            else if (name.includes('Galaxy Note')) uniqueSeries.add('Note Series');

            else if (name.toLowerCase().includes('iphone')) {
                if (name.toLowerCase().includes('air')) uniqueSeries.add('Air Series');

                const match = name.match(/iPhone\s+(\d+)/i);
                if (match) {
                    uniqueSeries.add(`${match[1]} Series`);
                }

                if (name.toLowerCase().includes('iphone x')) uniqueSeries.add('X Series');
                if (name.toLowerCase().includes('se')) uniqueSeries.add('SE Series');
            }

            else if (name.includes('Redmi Note')) uniqueSeries.add('Redmi Note');
            else if (name.includes('Pixel')) uniqueSeries.add('Pixel Series');
            else if (name.includes('Nord')) uniqueSeries.add('Nord Series');
            else if (name.includes('Reno')) uniqueSeries.add('Reno Series');

            // Smartwatch - Apple Watch
            else if (lowerName.includes('apple') && (lowerName.includes('watch') || lowerName.includes('ultra') || lowerName.includes('series'))) {
                if (lowerName.includes('ultra')) uniqueSeries.add('Watch Ultra');
                else if (lowerName.includes('se')) uniqueSeries.add('Watch SE');
                
                const seriesMatch = name.match(/Series\s+(\d+)/i);
                if (seriesMatch) {
                    uniqueSeries.add(`Series ${seriesMatch[1]}`);
                } else if (!lowerName.includes('ultra') && !lowerName.includes('se')) {
                    uniqueSeries.add('Watch Series');
                }
            }
        });

        const list = Array.from(uniqueSeries).sort((a: string, b: string) => {
            // Tablet sorting (Pro > Air > mini > Standard)
            if (a.includes('iPad') && b.includes('iPad')) {
                const order = ['iPad Pro', 'iPad Air', 'iPad mini', 'iPad (Standard)'];
                return order.indexOf(a) - order.indexOf(b);
            }
            if (a.includes('Galaxy Tab') && b.includes('Galaxy Tab')) {
                const order = ['Galaxy Tab S', 'Galaxy Tab A', 'Other Galaxy Tab'];
                return order.indexOf(a) - order.indexOf(b);
            }

            // Custom Sort for iPhones
            // Air -> Numbers Desc -> X -> SE
            if (a === 'Air Series') return -1;
            if (b === 'Air Series') return 1;

            const numA = parseInt(a);
            const numB = parseInt(b);

            if (!isNaN(numA) && !isNaN(numB)) return numB - numA; // Descending
            if (!isNaN(numA)) return -1; // Numbers first
            if (!isNaN(numB)) return 1;

            if (a === 'X Series') return -1; // X after numbers
            if (b === 'X Series') return 1;

            if (a === 'SE Series') return -1; // SE after X ? Or X after SE? usually X is better?
            if (b === 'SE Series') return 1;

            // Apple Watch sorting
            if ((a.includes('Watch') || a.includes('Series')) && (b.includes('Watch') || b.includes('Series'))) {
                if (a.includes('Ultra') && !b.includes('Ultra')) return -1;
                if (!a.includes('Ultra') && b.includes('Ultra')) return 1;
                
                if (a.includes('Ultra') && b.includes('Ultra')) {
                    const numA = parseInt(a.replace(/[^0-9]/g, '')) || 1;
                    const numB = parseInt(b.replace(/[^0-9]/g, '')) || 1;
                    return numB - numA;
                }

                if (a.includes('Series') && b.includes('Series')) {
                    const numA = parseInt(a.replace(/[^0-9]/g, ''));
                    const numB = parseInt(b.replace(/[^0-9]/g, ''));
                    if (!isNaN(numA) && !isNaN(numB)) return numB - numA;
                }

                if (a.includes('SE') && !b.includes('SE')) return 1; // SE lower than Series
                if (!a.includes('SE') && b.includes('SE')) return -1;
            }

            return a.localeCompare(b);
        });

        return list.length > 1 ? list : [];
    }, [models]);

    // Filter Models
    const filteredModels = useMemo(() => {
        return models.filter(m => {
            if (!m.name) return false;
            const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());

            if (!matchesSearch) return false;

            if (activeSeries) {
                const name = m.name.toLowerCase();

                // iPhone filters
                if (activeSeries === 'Air Series') return name.includes('air');
                if (activeSeries.includes('Series') && !isNaN(parseInt(activeSeries))) {
                    // "17 Series" -> check if contains "17"
                    // Be careful: "17" vs "17 Pro". Both contain 17.
                    // But "iPhone 1" shouldn't match "iPhone 13". 
                    // Regex boundary?
                    const num = parseInt(activeSeries);
                    return name.match(new RegExp(`iphone\\s+${num}\\b`, 'i'));
                }
                if (activeSeries === 'X Series') return name.includes('iphone x');
                if (activeSeries === 'SE Series') return name.includes('se');

                // iPad Filters
                if (activeSeries === 'iPad Pro') return name.includes('ipad pro');
                if (activeSeries === 'iPad Air') return name.includes('ipad air');
                if (activeSeries === 'iPad mini') return name.includes('ipad mini');
                if (activeSeries === 'iPad (Standard)') return name.includes('ipad') && !name.includes('pro') && !name.includes('air') && !name.includes('mini');

                // Galaxy Tab Filters
                if (activeSeries === 'Galaxy Tab S') return name.includes('galaxy tab s');
                if (activeSeries === 'Galaxy Tab A') return name.includes('galaxy tab a');
                if (activeSeries === 'Other Galaxy Tab') return name.includes('galaxy tab') && !name.includes('tab s') && !name.includes('tab a');

                // OnePlus Pad Filters
                if (activeSeries === 'OnePlus Pad') return name.includes('oneplus pad');

                // Realme Pad Filters
                if (activeSeries === 'Realme Pad') return name.includes('realme pad');

                // Other Tablets
                if (activeSeries === 'Xiaomi Pad') return name.includes('xiaomi pad') || name.includes('mi pad');
                if (activeSeries === 'Redmi Pad') return name.includes('redmi pad');
                if (activeSeries === 'Oppo Pad') return name.includes('oppo pad');
                if (activeSeries === 'Poco Pad') return name.includes('poco pad');
                if (activeSeries === 'Lenovo Tab') return name.includes('lenovo tab');
                if (activeSeries === 'Lenovo Yoga Tab') return name.includes('yoga tab');
                if (activeSeries === 'Moto Tab') return name.includes('moto tab') || name.includes('motorola tab');
                if (activeSeries === 'Nokia T Series') return name.includes('nokia t');

                // Other Series
                if (activeSeries === 'S Series') return m.name.includes('Galaxy S');
                if (activeSeries === 'A Series') return m.name.includes('Galaxy A');
                if (activeSeries === 'M Series') return m.name.includes('Galaxy M');
                if (activeSeries === 'F Series') return m.name.includes('Galaxy F');
                if (activeSeries === 'Z Fold Series') return m.name.includes('Fold');
                if (activeSeries === 'Z Flip Series') return m.name.includes('Flip');
                if (activeSeries === 'Z Series') return m.name.includes('Galaxy Z');
                if (activeSeries === 'Note Series') return m.name.includes('Galaxy Note');

                if (activeSeries === 'Redmi Note') return m.name.includes('Redmi Note');
                if (activeSeries === 'Pixel Series') return m.name.includes('Pixel');
                if (activeSeries === 'Nord Series') return m.name.includes('Nord');
                if (activeSeries === 'Reno Series') return m.name.includes('Reno');

                // Apple Watch filters
                if (activeSeries === 'Watch Ultra') return name.includes('ultra');
                if (activeSeries === 'Watch SE') return name.includes('se');
                if (activeSeries.startsWith('Series ')) {
                    const num = activeSeries.replace('Series ', '');
                    return name.includes(`series ${num}`) && !name.includes('se');
                }
                if (activeSeries === 'Watch Series') return name.includes('apple watch') && !name.includes('series') && !name.includes('ultra') && !name.includes('se');
                
                // If it's a known series but doesn't match any branch, default to false if activeSeries is set
                // to avoid showing all models when a specific series is selected.
                // However, if it's a completely unknown series string, default to true.
                return false; 
            }

            return true;
        }).sort((a, b) => {
            // Priority-based sorting for catalog (latest models first)
            const getScore = (name: string) => {
                let score = 0;
                const lower = name.toLowerCase();
                
                // iPhone score
                const iphoneMatch = lower.match(/iphone\s+(\d+)/);
                if (iphoneMatch) {
                    score = 2000 + (parseInt(iphoneMatch[1]) * 10);
                    if (lower.includes('pro max')) score += 5;
                    else if (lower.includes('pro')) score += 4;
                    else if (lower.includes('plus')) score += 3;
                    return score;
                }

                // Apple Watch score
                if (lower.includes('watch')) {
                    if (lower.includes('ultra 2')) score = 1000;
                    else if (lower.includes('ultra')) score = 950;
                    else if (lower.includes('series')) {
                        const m = lower.match(/series\s+(\d+)/);
                        if (m) score = 800 + parseInt(m[1]);
                    } else if (lower.includes('se 2nd') || lower.includes('se 2')) {
                        score = 750;
                    } else if (lower.includes('se')) {
                        score = 700;
                    }
                    return score;
                }

                // iPad score
                if (lower.includes('ipad')) {
                    if (lower.includes('pro')) score = 1500;
                    else if (lower.includes('air')) score = 1400;
                    else if (lower.includes('mini')) score = 1300;
                    else score = 1200;
                    
                    const m = lower.match(/(\d+)(st|nd|rd|th)\s+gen/);
                    if (m) score += parseInt(m[1]);
                    return score;
                }

                // Samsung Galaxy S series score
                const sMatch = lower.match(/(?:\s|^)s(\d+)/i) || lower.match(/galaxy\s+s(\d+)/i);
                if (sMatch && !lower.includes('tab')) {
                    score = 1600 + (parseInt(sMatch[1]) * 10);
                    if (lower.includes('ultra')) score += 5;
                    else if (lower.includes('plus')) score += 4;
                    else if (lower.includes('fe')) score -= 2;
                    return score;
                }

                // Samsung Galaxy A series score
                const aMatch = lower.match(/(?:\s|^)a(\d+)/i) || lower.match(/galaxy\s+a(\d+)/i);
                if (aMatch && !lower.includes('tab')) {
                    score = 1300 + (parseInt(aMatch[1]) * 10);
                    return score;
                }

                // Pixel score
                const pixelMatch = lower.match(/pixel\s+(\d+)/);
                if (pixelMatch) {
                    score = 1500 + (parseInt(pixelMatch[1]) * 10);
                    if (lower.includes('pro')) score += 5;
                    return score;
                }

                // OnePlus score
                const oneplusMatch = lower.match(/oneplus\s+(\d+)/);
                if (oneplusMatch) {
                    score = 1400 + (parseInt(oneplusMatch[1]) * 10);
                    if (lower.includes('pro')) score += 5;
                    return score;
                }

                // General Year-based score (e.g. "Model 2026")
                const yearMatch = lower.match(/(202[456])/);
                if (yearMatch) {
                    score = 1000 + (parseInt(yearMatch[1]) - 2020) * 100;
                    return score;
                }
                
                return score;
            };

            const scoreA = getScore(a.name);
            const scoreB = getScore(b.name);

            if (scoreA !== scoreB) return scoreB - scoreA;
            return a.name.localeCompare(b.name);
        });
    }, [models, searchTerm, activeSeries]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-accent rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold">Select Model</h2>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search your model (e.g. iPhone 13, S23)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-card border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Series Filters */}
                {seriesList.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Choose by series</h3>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setActiveSeries(null)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${!activeSeries
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-card hover:bg-accent border-border'
                                    }`}
                            >
                                All
                            </button>
                            {seriesList.map(series => (
                                <button
                                    key={series}
                                    onClick={() => setActiveSeries(series === activeSeries ? null : series)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${activeSeries === series
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-card hover:bg-accent border-border'
                                        }`}
                                >
                                    {series}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="min-h-[300px] flex items-center justify-center">
                    <SVGLoader className="bg-transparent backdrop-blur-none w-full" />
                </div>
            ) : filteredModels.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <p className="text-lg font-medium">No models found</p>
                    <p className="text-sm">Try searching for something else</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredModels.map((model, index) => (
                        <motion.button
                            key={model.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => onSelect(model)}
                            className="flex flex-col items-center justify-between p-4 border rounded-xl bg-white text-black hover:border-primary hover:shadow-lg transition-all text-center h-full group"
                        >
                            <div className="relative w-full aspect-[2/3] mb-4 flex items-center justify-center bg-white rounded-lg transition-colors overflow-hidden">
                                <ModelImage
                                    src={model.img}
                                    alt={model.name}
                                    priority={index < 8}
                                    scale={
                                        model.name.includes('iPhone')
                                            ? (EXCLUDED_MODELS.has(model.name) ? 1 : 1.35)
                                            : (model.name.toLowerCase().includes('watch') ? 1.5 : 1.05)
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="font-semibold text-sm line-clamp-2">
                                    {model.name.split('(')[0].trim()}
                                </span>
                            </div>
                        </motion.button>
                    ))}
                </div>
            )}
        </div>
    );
}
