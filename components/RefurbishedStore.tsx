'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Laptop, Tablet, Watch, Check, Truck, Info, ShieldCheck, MapPin, Loader2, X, ArrowRight, Wallet, Sparkles } from 'lucide-react';
import { checkPincodeAvailability, placeOrder } from '@/actions/orders';
import { useRouter } from 'next/navigation';

interface RefurbishedStoreProps {
    user?: any;
}

interface Product {
    id: string;
    name: string;
    category: 'smartphone' | 'laptop' | 'tablet' | 'watch';
    basePrice: number;
    description: string;
    details: string;
    emoji: string;
    colors: string[];
    grades: {
        pristine: number; // premium offset
        superb: number;   // baseline/medium offset
        good: number;     // cheap offset
    };
}

const PRODUCTS: Product[] = [
    {
        id: 'iphone-15-pro-max',
        name: 'Apple iPhone 15 Pro Max',
        category: 'smartphone',
        basePrice: 84999,
        description: '256GB Storage | Premium Titanium Body | 100% Battery Health',
        details: 'A17 Pro chip, Action button, USB-C, and premium 5x telephoto camera.',
        emoji: '📱',
        colors: ['Natural Titanium', 'Blue Titanium', 'Black Titanium', 'White Titanium'],
        grades: { pristine: 4000, superb: 0, good: -4000 }
    },
    {
        id: 'macbook-pro-m4',
        name: 'Apple MacBook Pro (M4 Chip)',
        category: 'laptop',
        basePrice: 154000,
        description: '14.2-inch Liquid Retina XDR | M4 CPU | 16GB RAM | 512GB SSD',
        details: 'Space Black, pristine chassis, full original warranty, box included.',
        emoji: '💻',
        colors: ['Space Black', 'Silver'],
        grades: { pristine: 8000, superb: 0, good: -8000 }
    },
    {
        id: 'iphone-14-pro-max',
        name: 'Apple iPhone 14 Pro Max',
        category: 'smartphone',
        basePrice: 69999,
        description: '256GB Storage | Deep Purple | Battery Health 92%',
        details: 'Dynamic Island, A16 Bionic chip, and Pro camera system.',
        emoji: '📱',
        colors: ['Deep Purple', 'Space Black', 'Gold', 'Silver'],
        grades: { pristine: 3000, superb: 0, good: -3000 }
    },
    {
        id: 'apple-watch-ultra-2',
        name: 'Apple Watch Ultra 2',
        category: 'watch',
        basePrice: 49999,
        description: '49mm Titanium Case | GPS + Cellular | Orange Trail Loop',
        details: 'Tested deep-sea diagnostic, double tap gesture, brightest display.',
        emoji: '⌚',
        colors: ['Titanium (Orange Loop)', 'Titanium (Blue Loop)', 'Titanium (Midnight Loop)'],
        grades: { pristine: 2500, superb: 0, good: -2500 }
    },
    {
        id: 'macbook-air-m1',
        name: 'Apple MacBook Air (M1 Chip)',
        category: 'laptop',
        basePrice: 39999,
        description: '13.3-inch Retina | M1 Chip | 8GB RAM | 256GB SSD',
        details: 'Space Gray, fanless quiet cooling, extraordinary 15-hour battery.',
        emoji: '💻',
        colors: ['Space Gray', 'Silver', 'Gold'],
        grades: { pristine: 3000, superb: 0, good: -3000 }
    },
    {
        id: 'ipad-air-5',
        name: 'Apple iPad Air (5th Gen)',
        category: 'tablet',
        basePrice: 28999,
        description: '10.9-inch Liquid Retina | Apple M1 Chip | 64GB Storage',
        details: 'Touch ID, Center Stage front camera, fully compatible with Apple Pencil 2.',
        emoji: '📟',
        colors: ['Space Gray', 'Blue', 'Purple', 'Starlight'],
        grades: { pristine: 2000, superb: 0, good: -2000 }
    },
    {
        id: 'iphone-13',
        name: 'Apple iPhone 13',
        category: 'smartphone',
        basePrice: 29999,
        description: '128GB Storage | Midnight Slate | Battery Health 88%',
        details: 'Cinematic mode camera, superb durable design, A15 Bionic performance.',
        emoji: '📱',
        colors: ['Midnight', 'Blue', 'Starlight', 'Red', 'Pink'],
        grades: { pristine: 2000, superb: 0, good: -2000 }
    },
    {
        id: 'apple-watch-series-8',
        name: 'Apple Watch Series 8',
        category: 'watch',
        basePrice: 21999,
        description: '45mm Midnight Aluminum | GPS | Sport Band',
        details: 'Temperature sensing, Crash Detection, Sleep Stages tracking.',
        emoji: '⌚',
        colors: ['Midnight', 'Starlight', 'Silver', 'Red'],
        grades: { pristine: 1500, superb: 0, good: -1500 }
    }
];

export default function RefurbishedStore({ user }: RefurbishedStoreProps) {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'smartphone' | 'laptop' | 'tablet' | 'watch'>('all');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Modal State
    const [color, setColor] = useState('');
    const [grade, setGrade] = useState<'pristine' | 'superb' | 'good'>('superb');
    const [pincode, setPincode] = useState('');
    const [isPincodeChecking, setIsPincodeChecking] = useState(false);
    const [isPincodeValid, setIsPincodeValid] = useState<boolean | null>(null);
    
    // Checkout Details
    const [checkoutStep, setCheckoutStep] = useState<'details' | 'pincode' | 'address' | 'complete'>('details');
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'doorstep_upi'>('cod');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderNumber, setOrderNumber] = useState<number | null>(null);

    const filteredProducts = selectedCategory === 'all' 
        ? PRODUCTS 
        : PRODUCTS.filter(p => p.category === selectedCategory);

    const calculateCurrentPrice = (product: Product, selectedGrade: 'pristine' | 'superb' | 'good') => {
        return product.basePrice + product.grades[selectedGrade];
    };

    const handleOpenCheckout = (product: Product) => {
        setSelectedProduct(product);
        setColor(product.colors[0]);
        setGrade('superb');
        setPincode('');
        setIsPincodeValid(null);
        setCheckoutStep('details');
        setPhone('');
        setAddress('');
    };

    const handleCheckPincode = async () => {
        if (pincode.length !== 6) return;
        setIsPincodeChecking(true);
        try {
            const available = await checkPincodeAvailability(pincode);
            setIsPincodeValid(available);
            if (available) {
                setCheckoutStep('address');
            }
        } catch (error) {
            console.error(error);
            setIsPincodeValid(false);
        } finally {
            setIsPincodeChecking(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedProduct || !name || phone.length < 10 || !address || isPincodeValid === false) return;
        setIsSubmitting(true);
        try {
            const price = calculateCurrentPrice(selectedProduct, grade);
            const deviceTag = `[BUY Refurbished] ${selectedProduct.name}`;
            const variantTag = `${color} | ${grade.toUpperCase()} Grade`;
            
            const answers = {
                color,
                grade,
                buyerName: name,
                phone,
                paymentMethod,
                type: 'refurbished_purchase',
                isExpress: false,
                scheduledDate: new Date().toISOString(),
                scheduledSlot: "Express Doorstep Delivery"
            };

            const res = await placeOrder(deviceTag, variantTag, price, address, pincode, null, answers);
            if (res && 'error' in res && res.error === 'UNAUTHORIZED') {
                alert('Session expired. Redirecting to login...');
                router.push('/login');
                return;
            }
            setCheckoutStep('complete');
        } catch (error) {
            console.error(error);
            alert('Failed to place order. Redirecting to login...');
            router.push('/login');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-6 max-w-6xl text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="text-center mb-16 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Premium Certified Refurbished
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    iProduct Store
                </h1>
                <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-base font-medium leading-relaxed">
                    Certified renewed and refurbished Apple products in Bangalore. Backed by up to 12 months warranty and instant doorstep inspection.
                </p>
            </div>

            {/* Category Navigation Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
                {(['all', 'smartphone', 'laptop', 'tablet', 'watch'] as const).map(cat => {
                    const label = cat === 'all' ? 'All Devices' : 
                                  cat === 'smartphone' ? 'iPhones' : 
                                  cat === 'laptop' ? 'MacBooks' : 
                                  cat === 'tablet' ? 'iPads' : 'Apple Watches';
                    const icon = cat === 'smartphone' ? <Smartphone className="w-4 h-4" /> :
                                 cat === 'laptop' ? <Laptop className="w-4 h-4" /> :
                                 cat === 'tablet' ? <Tablet className="w-4 h-4" /> :
                                 cat === 'watch' ? <Watch className="w-4 h-4" /> : null;
                    return (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border transition-all duration-200 ${
                                selectedCategory === cat 
                                    ? 'bg-blue-600 border-blue-500 text-slate-900 dark:text-white shadow-lg shadow-blue-600/10 scale-[1.02]' 
                                    : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:border-slate-200 dark:border-white/10'
                            }`}
                        >
                            {icon}
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* Condition Grades Panel */}
            <div className="bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 p-8 rounded-[2.5rem] mb-16 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full group-hover:bg-blue-500/10 transition-all duration-500" />
                <div className="relative z-10 space-y-6">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-500" /> 100% Tested. Certified Grades.
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2 p-5 bg-white dark:bg-white/[0.01] rounded-2xl border border-slate-200 dark:border-white/5 hover:border-blue-500/20 transition-all">
                            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider">Pristine Grade</span>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Like Brand New</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Zero scratches or signs of use. 95%+ Battery health guaranteed.</p>
                        </div>
                        <div className="space-y-2 p-5 bg-white dark:bg-white/[0.01] rounded-2xl border border-slate-200 dark:border-white/5 hover:border-indigo-500/20 transition-all">
                            <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-wider">Superb Grade</span>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Excellent Value</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Microscopic signs of wear invisible from 8 inches. 90%+ Battery health.</p>
                        </div>
                        <div className="space-y-2 p-5 bg-white dark:bg-white/[0.01] rounded-2xl border border-slate-200 dark:border-white/5 hover:border-purple-500/20 transition-all">
                            <span className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-wider">Good Grade</span>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Budget Friendly</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Minor visible scratches or scuffs. 85%+ Battery health. Max savings.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map(product => (
                    <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 p-6 rounded-[2.5rem] hover:border-blue-500/20 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                    >
                        <div className="space-y-4">
                            {/* Graphic Placeholder */}
                            <div className="h-44 w-full bg-slate-100 dark:bg-slate-900/50 rounded-2xl flex items-center justify-center overflow-hidden mb-6 relative border border-slate-200 dark:border-white/5">
                                <span className="absolute top-4 left-4 bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                                    Certified
                                </span>
                                <div className="text-6xl text-slate-700 group-hover:scale-105 transition-transform duration-300">
                                    {product.emoji}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-400 transition-colors">
                                    {product.name}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                    {product.description}
                                </p>
                                <p className="text-xs text-slate-600 line-clamp-2">
                                    {product.details}
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-between items-center border-t border-slate-200 dark:border-white/5 mt-6">
                            <div>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase tracking-wider">Superb Grade</span>
                                <span className="text-base font-extrabold text-blue-400">
                                    ₹{product.basePrice.toLocaleString()}
                                </span>
                            </div>
                            <button
                                onClick={() => handleOpenCheckout(product)}
                                className="px-5 py-2.5 bg-white text-black font-extrabold text-xs rounded-xl hover:bg-slate-100 active:scale-[0.98] transition-all"
                            >
                                Inquire &amp; Buy
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Glassmorphic Checkout Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-white dark:bg-white/80 dark:bg-slate-950/80 backdrop-blur sticky top-0 z-10">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{selectedProduct.emoji}</span>
                                    <div>
                                        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Purchase Refurbished</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verify service area and customize details</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 overflow-y-auto space-y-6 flex-1">
                                {checkoutStep === 'details' && (
                                    <div className="space-y-6">
                                        {/* Color Selection */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-black uppercase text-slate-600 dark:text-slate-400 tracking-wider">Choose Color</label>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedProduct.colors.map(col => (
                                                    <button
                                                        key={col}
                                                        onClick={() => setColor(col)}
                                                        className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all ${
                                                            color === col 
                                                                ? 'border-blue-500 bg-blue-500/10 text-slate-900 dark:text-white' 
                                                                : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:border-slate-200 dark:border-white/10'
                                                        }`}
                                                    >
                                                        {col}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Grade Selection */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-black uppercase text-slate-600 dark:text-slate-400 tracking-wider">Select Cosmetic Condition</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {(['pristine', 'superb', 'good'] as const).map(grd => {
                                                    const priceOffset = selectedProduct.grades[grd];
                                                    const offsetLabel = priceOffset === 0 ? 'No offset' : 
                                                                        priceOffset > 0 ? `+₹${priceOffset.toLocaleString()}` : `-₹${Math.abs(priceOffset).toLocaleString()}`;
                                                    const gradeLabel = grd === 'pristine' ? 'Pristine' : grd === 'superb' ? 'Superb' : 'Good';
                                                    return (
                                                        <button
                                                            key={grd}
                                                            onClick={() => setGrade(grd)}
                                                            className={`p-4 border rounded-2xl flex flex-col items-center gap-1 transition-all ${
                                                                grade === grd 
                                                                    ? 'border-blue-500 bg-blue-500/10 text-slate-900 dark:text-white' 
                                                                    : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:border-slate-200 dark:border-white/10'
                                                            }`}
                                                        >
                                                            <span className="font-bold text-xs">{gradeLabel}</span>
                                                            <span className={`text-[10px] font-semibold ${priceOffset > 0 ? 'text-green-400' : priceOffset < 0 ? 'text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                                                {offsetLabel}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Price Card */}
                                        <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex justify-between items-center">
                                            <div>
                                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Calculated Cheap Price</span>
                                                <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                                                    ₹{calculateCurrentPrice(selectedProduct, grade).toLocaleString()}
                                                </h4>
                                            </div>
                                            <button
                                                onClick={() => setCheckoutStep('pincode')}
                                                className="px-6 py-3 bg-blue-600 text-slate-900 dark:text-white font-extrabold text-sm rounded-xl hover:bg-blue-500 active:scale-[0.98] transition-all flex items-center gap-2"
                                            >
                                                Confirm Customization <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {checkoutStep === 'pincode' && (
                                    <div className="space-y-6 text-center py-6">
                                        <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <MapPin className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-extrabold text-xl">Service Area Check</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm">Enter your Bangalore pincode to verify doorstep delivery eligibility.</p>
                                        </div>
                                        <div className="max-w-xs mx-auto space-y-4">
                                            <input
                                                type="text"
                                                maxLength={6}
                                                placeholder="e.g. 560037"
                                                value={pincode}
                                                onChange={e => {
                                                    setPincode(e.target.value.replace(/\D/g, ''));
                                                    setIsPincodeValid(null);
                                                }}
                                                className="w-full h-14 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] rounded-xl text-center text-xl font-bold tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            />
                                            <button
                                                onClick={handleCheckPincode}
                                                disabled={pincode.length !== 6 || isPincodeChecking}
                                                className="w-full h-12 bg-blue-600 disabled:opacity-50 text-slate-900 dark:text-white font-bold text-xs rounded-xl hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                                            >
                                                {isPincodeChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check Availability'}
                                            </button>

                                            {isPincodeValid === false && (
                                                <p className="text-xs text-red-500 font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                                                    We currently do not deliver to this pincode. Please try another Bangalore pincode.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {checkoutStep === 'address' && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-600 dark:text-slate-400 tracking-wider">Your Full Name</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                placeholder="Enter full name"
                                                className="w-full h-12 px-4 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-600 dark:text-slate-400 tracking-wider">Mobile Number</label>
                                            <div className="flex gap-2">
                                                <div className="flex items-center justify-center px-4 bg-white dark:bg-white/[0.02] rounded-xl border border-slate-200 dark:border-white/10 font-mono text-sm text-slate-500 dark:text-slate-400">
                                                    +91
                                                </div>
                                                <input
                                                    type="tel"
                                                    maxLength={10}
                                                    value={phone}
                                                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                                                    placeholder="98765 43210"
                                                    className="flex-1 h-12 px-4 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] rounded-xl text-sm outline-none focus:border-blue-500 transition-colors font-mono tracking-widest text-lg"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-600 dark:text-slate-400 tracking-wider">Delivery Address</label>
                                            <textarea
                                                value={address}
                                                onChange={e => setAddress(e.target.value)}
                                                placeholder="Flat/House no, building name, street area, landmark, pincode..."
                                                className="w-full p-4 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] rounded-xl text-sm min-h-[100px] outline-none focus:border-blue-500 transition-colors resize-none"
                                            />
                                        </div>

                                        {/* Payment Method Selector */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-black uppercase text-slate-600 dark:text-slate-400 tracking-wider block">Doorstep Payment Option</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => setPaymentMethod('cod')}
                                                    className={`p-4 border rounded-2xl flex flex-col items-start gap-1 text-left transition-all ${
                                                        paymentMethod === 'cod' 
                                                            ? 'border-blue-500 bg-blue-500/10 text-slate-900 dark:text-white' 
                                                            : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:border-slate-200 dark:border-white/10'
                                                    }`}
                                                >
                                                    <span className="font-bold text-sm">Cash on Delivery</span>
                                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Pay hard cash after doorstep inspection.</span>
                                                </button>
                                                <button
                                                    onClick={() => setPaymentMethod('doorstep_upi')}
                                                    className={`p-4 border rounded-2xl flex flex-col items-start gap-1 text-left transition-all ${
                                                        paymentMethod === 'doorstep_upi' 
                                                            ? 'border-blue-500 bg-blue-500/10 text-slate-900 dark:text-white' 
                                                            : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:border-slate-200 dark:border-white/10'
                                                    }`}
                                                >
                                                    <span className="font-bold text-sm">Doorstep UPI / Card</span>
                                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Google Pay, PhonePe, or Cards at delivery.</span>
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handlePlaceOrder}
                                            disabled={isSubmitting || !name || phone.length < 10 || !address}
                                            className="w-full h-14 bg-blue-600 disabled:opacity-50 text-slate-900 dark:text-white font-extrabold text-sm rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-600/10 transition-all flex items-center justify-center gap-2 mt-6"
                                        >
                                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Wallet className="w-5 h-5" /> Book Doorstep Delivery &amp; Inspection</>}
                                        </button>
                                    </div>
                                )}

                                {checkoutStep === 'complete' && (
                                    <div className="text-center py-10 space-y-6">
                                        <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                                            <Check className="w-10 h-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-black text-3xl text-slate-900 dark:text-white">Order Confirmed!</h3>
                                            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-sm mx-auto font-medium">
                                                Your refurbished technical care delivery order has been successfully logged into our system!
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] inline-block text-xs font-semibold text-slate-500 dark:text-slate-400">
                                            A field riders executive will reach you within 24 hours for doorstep inspection and transaction fulfillment.
                                        </div>
                                        <div>
                                            <button
                                                onClick={() => {
                                                    setSelectedProduct(null);
                                                    router.push('/orders');
                                                }}
                                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                                            >
                                                Track Delivery Status →
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
