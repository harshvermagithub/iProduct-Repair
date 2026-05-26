'use client';

import { motion } from 'framer-motion';
import { ShieldAlert, Cpu, Wrench, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';

export default function HowItWorks() {
    return (
        <section className="py-24 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-y border-slate-200 dark:border-white/5 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-6 relative z-10 max-w-6xl">
                <div className="text-center mb-20 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 font-bold text-xs uppercase tracking-widest"
                    >
                        Dual Operations
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                        Seamless &amp; Efficient Process
                    </h2>
                    <p className="text-slate-500 max-w-xl mx-auto text-base font-medium">
                        Whether you need a high-quality doorstep repair or want to purchase a premium certified renewed device at cheap costs, we have you covered.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Track 1: Doorstep Repair */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-8 rounded-[2.5rem] space-y-8 flex flex-col justify-between hover:border-blue-500/20 transition-all duration-300 relative group shadow-sm dark:shadow-none"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all duration-300" />
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
                                    <Wrench className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Onsite Apple Repair</h3>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                Professional doorstep service in Bangalore. Book online, and our technician will repair your device right in front of you.
                            </p>

                            <div className="space-y-4 pt-2">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-white/10 flex items-center justify-center font-bold text-xs text-blue-500 dark:text-blue-400 shrink-0">1</div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Diagnose Faults Online</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Select your model (iPhone, MacBook, etc.) and check repair costs instantly.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-white/10 flex items-center justify-center font-bold text-xs text-blue-500 dark:text-blue-400 shrink-0">2</div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Schedule Doorstep Appointment</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Pick a convenient time. Our certified engineer will reach you in 3 hours.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-white/10 flex items-center justify-center font-bold text-xs text-blue-500 dark:text-blue-400 shrink-0">3</div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Get Fixed with 12M Warranty</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Watch the repair live at your place. Secured by certified warranty protection.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Track 2: Pre-owned sales */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-8 rounded-[2.5rem] space-y-8 flex flex-col justify-between hover:border-blue-500/20 transition-all duration-300 relative group shadow-sm dark:shadow-none"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all duration-300" />
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Shop Certified Renewed</h3>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                Upgrade to certified high-quality iPhones, MacBooks, iPads, or Windows laptops at extremely cheap, budget-friendly costs.
                            </p>

                            <div className="space-y-4 pt-2">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-white/10 flex items-center justify-center font-bold text-xs text-blue-500 dark:text-blue-400 shrink-0">1</div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Browse Pre-Owned Deals</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Explore completely tested premium models in pristine condition.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-white/10 flex items-center justify-center font-bold text-xs text-blue-500 dark:text-blue-400 shrink-0">2</div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Lock Cheap Prices</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Secure the lowest rates in the market with certified diagnostic reports.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-white/10 flex items-center justify-center font-bold text-xs text-blue-500 dark:text-blue-400 shrink-0">3</div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Doorstep Safe Delivery</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Fast delivery with service payment flexibility and 100% moneyback protection.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
