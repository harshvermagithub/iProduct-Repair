
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CategorySelector from './CategorySelector';
import BrandSelector from './BrandSelector';
import ModelSelector from './ModelSelector';
import VariantSelector from './VariantSelector';
import QuotePreview from './QuotePreview';
import ChecklistWizard from './ChecklistWizard';
import FinalQuote from './FinalQuote';
import StepLogin from './StepLogin';
import { Brand, Model, Variant } from '@/lib/store';
import { useRouter } from 'next/navigation';

type Step = 'category' | 'brand' | 'model' | 'variant' | 'quote_preview' | 'checklist' | 'login_check' | 'final_quote';

interface SellWizardProps {
    initialBrands: Brand[];
    initialCategory?: string;
    initialBrandId?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user?: any; // Session User
}

import { fetchBrands } from '@/actions/catalog';

export default function SellWizard({ initialBrands, initialCategory, initialBrandId, user: initialUser }: SellWizardProps) {
    const router = useRouter();
    // If a category is provided via info, we start at 'brand' selection (skipping category select)
    // Exception: If category is 'repair', we treat it as smartphone but set isRepair=true

    const resolveCategory = (cat?: string) => {
        if (!cat) return 'smartphone';
        if (cat === 'repair') return 'smartphone';
        return cat;
    };

    const resolvedCategory = resolveCategory(initialCategory);

    // Initial Brand Logic
    const preSelectedBrand = initialBrandId ? initialBrands.find(b => b.id === initialBrandId) : null;

    const [step, setStep] = useState<Step>(
        preSelectedBrand ? 'model' : (initialCategory ? 'brand' : 'category')
    );
    const [category, setCategory] = useState<string>(resolvedCategory);
    const [isRepair, setIsRepair] = useState(initialCategory === 'repair' || initialCategory === 'unbreakable-screenguard');

    // We need to maintain local brands state in case category changes
    const [brands, setBrands] = useState<Brand[]>(initialBrands);

    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(preSelectedBrand || null);
    const [selectedModel, setSelectedModel] = useState<Model | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [skippedVariant, setSkippedVariant] = useState(false);
    const [answers, setAnswers] = useState<Record<string, unknown>>({});


    // Track user state locally so we can update it after inline login
    // Track user state locally so we can update it after inline login
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(initialUser);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Slight timeout ensures DOM is ready before scrolling
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
        }
    }, [step]);

    const handleCategorySelect = async (cat: string) => {
        let targetCategory = cat;
        if (cat === 'repair') {
            setIsRepair(true);
            targetCategory = 'smartphone'; // Default to smartphone repair for now
        } else if (cat === 'unbreakable-screenguard') {
            setIsRepair(true); // Re-use repair boolean to skip quote UI logic and go straight to booking
            setCategory('unbreakable-screenguard');
            
            // Only fetch specific brands to mimic actual screen guard support
            const allBrands = await fetchBrands('smartphone');
            const requiredBrands = ['Apple', 'Samsung', 'OnePlus', 'Google'];
            const newBrands = allBrands.filter(b => requiredBrands.includes(b.name));
            
            setBrands(newBrands);
            setStep('brand');
            return;
        } else {
            setIsRepair(false);
        }

        setCategory(targetCategory);

        // Fetch brands for the selected category
        const newBrands = await fetchBrands(targetCategory);
        setBrands(newBrands);
        setStep('brand');
    };

    const handleBrandSelect = (brand: Brand) => {
        setSelectedBrand(brand);
        setStep('model');
    };

    const handleModelSelect = (model: Model) => {
        setSelectedModel(model);
        setSkippedVariant(false);

        if (category === 'unbreakable-screenguard') {
            if (user) {
                setStep('final_quote');
            } else {
                setStep('login_check');
            }
            return;
        }

        setStep('variant');
    };

    const handleVariantAutoSkip = (variant: Variant) => {
        setSelectedVariant(variant);
        setSkippedVariant(true);
        if (isRepair) {
            setStep('checklist');
        } else {
            setStep('quote_preview');
        }
    };

    const handleVariantSelect = (variant: Variant) => {
        setSelectedVariant(variant);
        if (isRepair) {
            setStep('checklist');
        } else {
            setStep('quote_preview');
        }
    };

    const handleLoginSuccess = (loggedInUser: any) => {
        setUser(loggedInUser);
        setStep('final_quote');
    };

    const isVariantHidden = selectedVariant && (selectedVariant.name.toLowerCase().includes('no variant') || skippedVariant);
    const displayDeviceName = `${selectedBrand?.name} ${selectedModel?.name}`;
    const displayVariant = isVariantHidden ? '' : selectedVariant?.name;
    const quotePreviewDetails = isVariantHidden ? displayDeviceName : `${displayDeviceName} (${displayVariant})`;

    return (
        <div className="w-full max-w-6xl mx-auto">
            <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                {step === 'category' && (
                    <motion.div key="category" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <CategorySelector onSelect={handleCategorySelect} />
                    </motion.div>
                )}

                {step === 'brand' && (
                    <motion.div key="brand" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <BrandSelector
                            brands={brands}
                            onSelect={handleBrandSelect}
                            onBack={() => setStep('category')}
                        />
                    </motion.div>
                )}

                {step === 'model' && selectedBrand && (
                    <motion.div key="model" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <ModelSelector
                            brandId={selectedBrand.id}
                            category={category === 'unbreakable-screenguard' ? 'smartphone' : category}
                            originalCategory={category}
                            onSelect={handleModelSelect}
                            onBack={() => {
                                if (initialBrandId) {
                                    router.back();
                                } else {
                                    setStep('brand');
                                }
                            }}
                        />
                    </motion.div>
                )}

                {step === 'variant' && selectedModel && (
                    <motion.div key="variant" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <VariantSelector
                            modelId={selectedModel?.id || ''}
                            category={category}
                            brand={selectedBrand}
                            onSelect={handleVariantSelect}
                            onAutoSkip={handleVariantAutoSkip}
                            onBack={() => setStep('model')}
                        />
                    </motion.div>
                )}

                {step === 'quote_preview' && selectedVariant && selectedBrand && selectedModel && (
                    <motion.div key="quote_preview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <QuotePreview
                            basePrice={selectedVariant.basePrice}
                            deviceDetails={quotePreviewDetails}
                            onGetExactValue={() => setStep('checklist')}
                            onBack={() => {
                                if (skippedVariant) {
                                    setStep('model');
                                } else {
                                    setStep('variant');
                                }
                            }}
                            isRepair={isRepair}
                        />
                    </motion.div>
                )}

                {step === 'checklist' && selectedModel && selectedVariant && (
                    <motion.div key="checklist" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <ChecklistWizard
                            deviceInfo={{ name: selectedModel.name, variant: displayVariant || '', img: selectedModel.img }}
                            category={category}
                            onComplete={(collectedAnswers) => {
                                setAnswers(collectedAnswers);
                                if (user) {
                                    setStep('final_quote');
                                } else {
                                    setStep('login_check');
                                }
                            }}
                            onBack={() => {
                                if (isRepair) {
                                    if (skippedVariant) setStep('model');
                                    else setStep('variant');
                                }
                                else setStep('quote_preview');
                            }}
                        />
                    </motion.div>
                )}

                {step === 'login_check' && (
                    <motion.div key="login_check" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <StepLogin onSuccess={handleLoginSuccess} />
                    </motion.div>
                )}


                {step === 'final_quote' && (category === 'unbreakable-screenguard' ? selectedModel : (selectedModel && selectedVariant)) && (
                    <motion.div key="final_quote" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <FinalQuote
                            basePrice={category === 'unbreakable-screenguard' ? 1999 : (selectedVariant?.basePrice || 0)}
                            answers={answers}
                            deviceInfo={{
                                name: displayDeviceName,
                                variant: category === 'unbreakable-screenguard' ? 'Unbreakable Screen Guard' : (displayVariant || '')
                            }}
                            category={category}
                            isRepair={isRepair}
                            user={user}
                            onRecalculate={() => {
                                if (category === 'unbreakable-screenguard') setStep('model');
                                else setStep('checklist');
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
