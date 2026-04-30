'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, ChevronRight, Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Model } from '@/lib/store';
import { searchGlobalModels } from '@/actions/catalog';
import Image from 'next/image';

export function HomeSearch() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Model[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setIsLoading(true);
                try {
                    const data = await searchGlobalModels(query);
                    setResults(data);
                    setShowResults(true);
                } catch (error) {
                    console.error('Search failed', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Handle clicking outside to close
    useEffect(() => {
        const handleClickOutside = () => setShowResults(false);
        if (showResults) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showResults]);

    const handleSelect = (model: Model) => {
        // Since we don't have a direct link to model selection wizard easily without complex state,
        // we'll redirect to the sell page with a query param that we can potentially handle later,
        // OR we can just redirect to the category selector first. 
        // Best approach given typical flows: Navigate to a Model Selection page with pre-filled search or ID.
        // For now, let's redirect to /sell but ideally we'd pass ?modelId=...
        // Assuming we can pass query params to /sell or a sub-page:
        // Actually, the user wants to "sell this device".
        // Let's try redirecting to /sell?search={query} or similar if implemented.
        // Or if we have a model details page (we don't seems like).
        // Let's invoke the router to /sell/variant-selection if we can, 
        // BUT the wizard is stateful.
        // Fallback: Redirect to /sell with category pre-selected if known, or just /sell.
        // Wait, models have categories.
        router.push(`/sell?category=${model.category}&brandId=${model.brandId}`);
    };

    return (
        <div className="relative z-50 w-full mx-auto" onClick={e => e.stopPropagation()}>
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-lg transition-opacity group-hover:opacity-100 opacity-0" />
                <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-500/50 transition-all">
                    <div className="pl-4 text-slate-400">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search your phone to sell..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.length >= 2 && setShowResults(true)}
                        className="w-full bg-transparent border-none py-4 px-3 text-base placeholder:text-slate-400 focus:outline-none"
                    />
                    {isLoading && (
                        <div className="pr-4">
                            <Loader2 className="w-5 h-5 animate-spin text-green-500" />
                        </div>
                    )}
                </div>
            </div>

            {showResults && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="max-h-[300px] overflow-y-auto">
                        {results.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => handleSelect(model)}
                                className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b last:border-0 border-slate-100 dark:border-slate-800/50 text-left"
                            >
                                <div className="w-10 h-12 relative shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                                    {model.img ? (
                                        <Image src={model.img} alt={model.name} fill className="object-contain p-1" />
                                    ) : (
                                        <Smartphone className="w-5 h-5 text-slate-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100">{model.name}</h4>
                                    <p className="text-xs text-slate-500 capitalize">{model.category || 'Smartphone'}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
