'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, ShieldCheck, Star, MapPin, Sparkles, Wrench, ShoppingBag } from 'lucide-react';
import HowItWorks from '@/components/HowItWorks';
import CategoryHeroAnimation from '@/components/CategoryHeroAnimation';
import { ReviewsMarquee } from '@/components/ReviewsMarquee';
import MacbookBootAnimation from '@/components/MacbookBootAnimation';
import { Logo } from '@/components/Logo';
import { HomeSearch } from '@/components/HomeSearch';
import { BrandRail } from '@/components/BrandRail';
import { useRouter } from 'next/navigation';
import { PriceGraphic, SpeedGraphic, SecurityGraphic } from '@/components/icons/FeatureIcons';
import { Brand } from '@/lib/store';

export function HomeClient({ initialBrands, activeCities = [], displayPrices = [] }: { initialBrands: Brand[], activeCities?: string[], displayPrices?: any[] }) {
    const router = useRouter();

    const handleCategorySelect = (category: string) => {
        router.push(`/sell?category=${category}`);
    };

    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden bg-background text-foreground transition-colors duration-300">
            {/* Hero Section */}
            <section className="relative pt-12 pb-24 md:pt-36 md:pb-40 overflow-hidden bg-background w-full border-b border-slate-200 dark:border-white/5">
                {/* Background FX */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[140px] opacity-50" />
                    <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] opacity-40" />
                </div>

                <div className="container mx-auto px-6 md:px-12 xl:px-20 max-w-[100vw] overflow-x-hidden">
                    <div className="flex flex-col xl:flex-row items-center gap-12 xl:gap-16">

                        {/* Premium Liquid Glass Hero Panel */}
                        <div className="flex-1 w-full max-w-3xl animate-in slide-in-from-bottom-8 fade-in-20 duration-700 z-20 mx-auto relative group">
                            {/* Organic Floating Liquid Blobs Behind the Glass Card */}
                            <div className="absolute inset-0 -z-10 overflow-visible pointer-events-none">
                                {/* Blue liquid blob */}
                                <div className="absolute top-[-40px] left-[-40px] w-64 h-64 bg-gradient-to-tr from-blue-400/40 to-indigo-500/40 rounded-full blur-3xl opacity-60 dark:opacity-40 animate-[pulse_6s_infinite_alternate]" />
                                {/* Purple/Pink liquid blob */}
                                <div className="absolute bottom-[-30px] right-[-30px] w-72 h-72 bg-gradient-to-tr from-purple-400/30 to-pink-500/30 rounded-full blur-3xl opacity-50 dark:opacity-30 animate-[pulse_8s_infinite_alternate_2s]" />
                                {/* Cyan/Teal liquid blob */}
                                <div className="absolute top-[30%] right-[20%] w-48 h-48 bg-gradient-to-tr from-cyan-400/30 to-teal-400/30 rounded-full blur-2xl opacity-40 dark:opacity-20 animate-[pulse_5s_infinite_alternate_1s]" />
                            </div>

                            {/* Liquid Glass Frosted Card */}
                            <div className="relative w-full rounded-[2.5rem] bg-white/50 dark:bg-slate-950/45 backdrop-blur-[20px] border border-white/40 dark:border-white/10 p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] hover:border-blue-500/25 dark:hover:border-blue-500/20 transition-all duration-500 flex flex-col items-center xl:items-start text-center xl:text-left overflow-visible">
                                {/* Glass Reflection Highlight line */}
                                <div className="absolute inset-x-12 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent" />
                                
                                {/* Trust Badge / Pill */}
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-sm mb-6 hover:border-blue-500/30 transition-all cursor-default w-fit">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                    </span>
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">Bangalore&apos;s Premium Apple Technical Care</span>
                                </div>

                                {/* Operational Cities Chips */}
                                <div className="flex flex-wrap justify-center xl:justify-start gap-2 mb-6">
                                    {activeCities.length > 0 ? activeCities.map(city => (
                                        <div key={city} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200/80 dark:border-white/10 shadow-sm transition-all cursor-default whitespace-nowrap">
                                            <MapPin className="w-3 h-3 text-blue-500" />
                                            {city}
                                        </div>
                                    )) : (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200/80 dark:border-white/10 shadow-sm transition-all cursor-default whitespace-nowrap">
                                            <MapPin className="w-3 h-3 text-blue-500" />
                                            Bengaluru (Marathahalli Center)
                                        </div>
                                    )}
                                </div>

                                {/* MAIN HEADLINE */}
                                <div className="max-w-full overflow-hidden relative">
                                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] md:leading-[1.05]">
                                        Sleek way to <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">repair &amp; buy.</span>
                                    </h1>
                                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-350 leading-relaxed max-w-xl mt-6 font-medium">
                                        Professional <span className="font-extrabold text-slate-900 dark:text-white border-b-2 border-blue-500/30 pb-0.5 dark:border-blue-500/40">doorstep Apple device repairs</span> in 3 hours, and premium <span className="font-extrabold text-slate-900 dark:text-white border-b-2 border-indigo-500/30 pb-0.5 dark:border-indigo-500/40">certified renewed gadgets</span> at cheap, budget-friendly prices.
                                    </p>
                                </div>

                                {/* CTA Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-8 w-full sm:w-auto justify-center xl:justify-start">
                                    <Link
                                        href="/sell?category=repair"
                                        className="inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black font-extrabold text-lg shadow-xl shadow-blue-500/5 hover:bg-slate-800 dark:hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group w-full sm:w-auto border border-transparent dark:border-white/10"
                                    >
                                        Book Onsite Repair
                                        <Wrench className="ml-2 h-5 w-5 text-blue-500 dark:text-blue-600 group-hover:rotate-12 transition-transform" />
                                    </Link>
                                    <Link
                                        href="/shop"
                                        className="inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group w-full sm:w-auto"
                                    >
                                        Shop Refurbished
                                        <ShoppingBag className="ml-2 h-5 w-5 text-white animate-bounce" />
                                    </Link>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto justify-center xl:justify-start">
                                    <Link
                                        href="/orders"
                                        className="inline-flex items-center justify-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors py-2"
                                    >
                                        Have an existing booking? Track Order Status →
                                    </Link>
                                </div>

                                {/* Trust Signals */}
                                <div className="flex items-center justify-center xl:justify-start gap-6 pt-8 text-sm font-semibold text-slate-500 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 rounded-full bg-blue-500/10 border border-blue-500/20"><Zap className="w-3.5 h-3.5 text-blue-500" /></div>
                                        3-Hour Onsite Repair
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 rounded-full bg-indigo-500/10 border border-indigo-500/20"><ShoppingBag className="w-3.5 h-3.5 text-indigo-500" /></div>
                                        Cheap Refurbished Deals
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 rounded-full bg-purple-500/10 border border-purple-500/20"><ShieldCheck className="w-3.5 h-3.5 text-purple-500" /></div>
                                        Up to 12M Warranty
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Interactive Canvas Hero Graphic */}
                        <div className="relative w-full h-[400px] xl:w-[600px] shrink-0 flex items-center justify-center mx-auto">
                            <MacbookBootAnimation />
                        </div>
                    </div>
                </div>
            </section>



            {/* Onsite Technical Lab Section */}
            <section className="py-24 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-white/5 relative overflow-hidden">
                <div className="container mx-auto px-6 max-w-6xl relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        {/* Image Column */}
                        <div className="flex-1 w-full relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl group">
                            <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/0 transition-colors z-10" />
                            <Image 
                                src="/images/apple_technical_repair.png" 
                                alt="Bangalore doorstep Apple technical repair diagnostics" 
                                width={800}
                                height={800}
                                className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                priority
                            />
                            <div className="absolute bottom-4 left-4 z-20 bg-white/70 dark:bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200/50 dark:border-white/5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                🛠️ Live doorstep diagnostics conducted in Bangalore
                            </div>
                        </div>

                        {/* Content Column */}
                        <div className="flex-1 space-y-6 text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider">
                                Live Doorstep Tech Care
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                                Bangalore&apos;s First <br />
                                <span className="text-blue-500">Live Diagnostic</span> Service.
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed font-medium">
                                Avoid the risk of sending your valuable Apple devices to unknown workshops in Bangalore. Our certified doorstep engineers bring complete diagnostic labs directly to your home or office desk in <strong className="font-extrabold text-slate-900 dark:text-white">Indiranagar, Koramangala, Whitefield, HSR Layout, or Marathahalli</strong> in 3 hours.
                            </p>
                            <div className="space-y-4 pt-2">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 shrink-0">
                                        <Wrench className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">30-Min Onsite Repair SLA</h4>
                                        <p className="text-xs text-slate-500 mt-0.5 font-medium">Most screen, battery, keyboard, or camera replacements are completed in under 45 minutes right in front of you.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">100% Genuine-Compatible Spares</h4>
                                        <p className="text-xs text-slate-500 mt-0.5 font-medium">Every spare part matches high retail grade performance standards and is covered by our secure 12-month technical care warranty.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Brands Rail */}
            <section className="py-16 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-white/5 w-full overflow-hidden">
                <div className="container mx-auto px-6 mb-12">
                    <p className="text-center text-sm font-bold text-blue-500 uppercase tracking-widest mb-8">Supporting Certified Technical Hardware</p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-80 hover:opacity-100 transition-opacity">
                        <span className="text-2xl font-black text-slate-900 dark:text-white cursor-default">Apple</span>
                        <span className="text-2xl font-black text-slate-500 dark:text-slate-400 cursor-default">MacBook</span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white cursor-default">iPhone</span>
                        <span className="text-2xl font-black text-slate-500 dark:text-slate-400 cursor-default">iPad</span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white cursor-default">Apple Watch</span>
                        <span className="text-2xl font-black text-slate-500 dark:text-slate-400 cursor-default">iMac</span>
                    </div>
                </div>

                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-200 dark:divide-white/5">
                        <div className="p-4">
                            <h3 className="text-3xl md:text-4xl font-extrabold text-blue-500 mb-2">10K+</h3>
                            <p className="text-sm text-slate-500 font-bold">Devices Serviced</p>
                        </div>
                        <div className="p-4">
                            <h3 className="text-3xl md:text-4xl font-extrabold text-indigo-400 mb-2">₹499</h3>
                            <p className="text-sm text-slate-500 font-bold">Repairs Starting From</p>
                        </div>
                        <div className="p-4">
                            <h3 className="text-3xl md:text-4xl font-extrabold text-purple-400 mb-2">100%</h3>
                            <p className="text-sm text-slate-500 font-bold">Genuine Spare Parts</p>
                        </div>
                        <div className="p-4">
                            <h3 className="text-3xl md:text-4xl font-extrabold text-pink-400 mb-2">4.9★</h3>
                            <p className="text-sm text-slate-500 font-bold">Customer Rating</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <HowItWorks />

            {/* Preused Products Grid from Live Page */}
            <section className="py-24 bg-background border-t border-slate-200 dark:border-white/5">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="text-center mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider">
                            Cheap renewed gadgets
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                            Best Selling Refurbished Products
                        </h2>
                        <p className="text-slate-500 font-medium text-sm md:text-base">
                            Browse certified pre-owned Apple inventory available for instant doorstep delivery in Bangalore.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Product Card 1 */}
                        <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-6 rounded-[2rem] hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between group shadow-sm dark:shadow-none">
                            <div className="h-48 w-full bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden mb-6 relative">
                                <span className="absolute top-4 left-4 bg-blue-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">Pristine</span>
                                <div className="text-6xl text-slate-400 dark:text-slate-700 group-hover:scale-105 transition-transform">💻</div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Apple MacBook Pro M4 Chip</h3>
                                <p className="text-xs text-slate-500">14-inch Display | 100% Battery Health | Warranty Included</p>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-base font-extrabold text-blue-400">Starting at ₹1,54,000</span>
                                    <Link href="/shop" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-colors">Inquire</Link>
                                </div>
                            </div>
                        </div>

                        {/* Product Card 2 */}
                        <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-6 rounded-[2rem] hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between group shadow-sm dark:shadow-none">
                            <div className="h-48 w-full bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden mb-6 relative">
                                <span className="absolute top-4 left-4 bg-indigo-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">Superb</span>
                                <div className="text-6xl text-slate-400 dark:text-slate-700 group-hover:scale-105 transition-transform">📱</div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Apple iPhone 15 Pro Max</h3>
                                <p className="text-xs text-slate-500">256GB Storage | Titanium Slate | Battery Health 96%</p>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-base font-extrabold text-blue-400">Starting at ₹84,999</span>
                                    <Link href="/shop" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-colors">Inquire</Link>
                                </div>
                            </div>
                        </div>

                        {/* Product Card 3 */}
                        <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-6 rounded-[2rem] hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between group shadow-sm dark:shadow-none">
                            <div className="h-48 w-full bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center overflow-hidden mb-6 relative">
                                <span className="absolute top-4 left-4 bg-purple-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">Certified</span>
                                <div className="text-6xl text-slate-400 dark:text-slate-700 group-hover:scale-105 transition-transform">⌚</div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Apple Watch Ultra 2</h3>
                                <p className="text-xs text-slate-500">49mm Case | GPS + Cellular | Rugged Loop</p>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-base font-extrabold text-blue-400">Starting at ₹49,999</span>
                                    <Link href="/shop" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-colors">Inquire</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reviews Section */}
            <section className="py-24 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-white/5 overflow-hidden w-full">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                        <div className="space-y-4 max-w-2xl text-center md:text-left">
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Loved by 10,000+ Customers</h2>
                            <p className="text-slate-500 font-medium">Read what your neighbors in Bangalore say about iProduct Repair doorstep engineers.</p>
                        </div>
                        <div className="flex items-center gap-1 mx-auto md:mx-0">
                            {[1, 2, 3, 4, 5].map(v => <Star key={v} className="w-6 h-6 fill-yellow-400 text-yellow-400" />)}
                            <span className="ml-2 font-black text-lg text-slate-900 dark:text-white">4.9/5 Rating</span>
                        </div>
                    </div>

                    <div className="mt-8">
                        <ReviewsMarquee />
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="py-24 bg-background overflow-hidden w-full relative border-t border-slate-200 dark:border-white/5">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider mb-6">
                            The iProduct Repair Advantage
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white mb-6 leading-none">
                            Why <span className="text-blue-500">Choose</span> Us
                        </h2>
                        <div className="h-1.5 w-24 bg-gradient-to-r from-blue-500 to-transparent rounded-full mb-8" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Benefit 1: Prices */}
                        <motion.div
                            whileHover={{ y: -10 }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="group p-8 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[2.5rem] relative overflow-hidden transition-all duration-500 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:border-blue-500/30 shadow-sm dark:shadow-none"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all duration-500" />
                            
                            <div className="relative z-10 space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest">
                                    Affordable Diagnostics
                                </div>
                                
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-2xl group-hover:scale-110 group-hover:bg-blue-500 transition-all duration-500">
                                    <PriceGraphic className="w-8 h-8 group-hover:text-slate-950 transition-colors" />
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">Economical Prices</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                        We provide certified doorstep hardware repairs at most economical rates, offering premium parts without premium price marks.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Benefit 2: Speed */}
                        <motion.div
                            whileHover={{ y: -10 }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="group p-8 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[2.5rem] relative overflow-hidden transition-all duration-500 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:border-blue-500/30 shadow-sm dark:shadow-none"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all duration-500" />
                            
                            <div className="relative z-10 space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest">
                                    Onsite Support
                                </div>
                                
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-2xl group-hover:scale-110 group-hover:bg-blue-500 transition-all duration-500">
                                    <SpeedGraphic className="w-8 h-8 group-hover:text-slate-950 transition-colors" />
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">3-Hour Doorstep</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                        Forget waiting in queues at local centers. Our certified field engineers reach your home or office in Bangalore within 3 hours.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Benefit 3: Safety */}
                        <motion.div
                            whileHover={{ y: -10 }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="group p-8 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[2.5rem] relative overflow-hidden transition-all duration-500 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:border-blue-500/30 shadow-sm dark:shadow-none"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all duration-500" />
                            
                            <div className="relative z-10 space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest">
                                    Data Protection
                                </div>
                                
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-2xl group-hover:scale-110 group-hover:bg-blue-500 transition-all duration-500">
                                    <SecurityGraphic className="w-8 h-8 group-hover:text-slate-950 transition-colors" />
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">Warranty &amp; Trust</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                        All repairs use high-grade genuine parts and are backed by up to 12 months warranty. Certified, safe, and highly trusted.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
}
