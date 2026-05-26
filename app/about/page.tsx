import React from 'react';
import { Logo } from '@/components/Logo';

export default function AboutPage() {
    return (
        <div className="container mx-auto px-6 py-20 md:py-32 space-y-16 max-w-4xl">
            <section className="space-y-6 text-center">
                <div className="flex justify-center mb-4">
                    <Logo className="scale-150" />
                </div>
                <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
                    Redefining Apple device care. Professional doorstep repairs and premium certified pre-owned devices at unbeatable cheap prices.
                </p>
            </section>

            <section className="space-y-6 border-t border-white/5 pt-12">
                <h2 className="text-3xl font-black text-white tracking-tight">Our Mission</h2>
                <p className="text-slate-400 leading-relaxed text-base font-medium">
                    At <strong className="font-extrabold text-white">iProduct Repair</strong>, we believe that keeping your beloved Apple devices in perfect working order should be seamless, convenient, and affordable. As a premier Apple Service Center in Bangalore, we are backed by a team of highly qualified and skilled technicians with years of relevant experience. 
                </p>
                <p className="text-slate-400 leading-relaxed text-base font-medium">
                    Whether your iPhone screen is shattered, your MacBook battery is failing, or you are looking to purchase certified refurbished iPhones, MacBooks, iPads, and Apple Watches at cheap, budget-friendly prices, we leave no stone unturned to achieve customer satisfaction. We breathe new life into valuable devices and extend their lifecycle, reducing e-waste responsibly.
                </p>
            </section>

            <section className="space-y-8 border-t border-white/5 pt-12">
                <h2 className="text-3xl font-black text-white tracking-tight">Why Choose Us?</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden transition-all duration-300 hover:bg-white/[0.04]">
                        <h3 className="font-extrabold text-xl text-white mb-2">Doorstep &amp; Onsite Repairs</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            No need to travel. Our certified technicians meet you at your home or office in Bangalore and repair your iPhone or MacBook right in front of you.
                        </p>
                    </div>
                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden transition-all duration-300 hover:bg-white/[0.04]">
                        <h3 className="font-extrabold text-xl text-white mb-2">Cheap Refurbished Sales</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Looking to upgrade? Browse our premium selection of certified pre-owned Apple &amp; Windows devices, completely tested and backed by warranty, at very cheap costs.
                        </p>
                    </div>
                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden transition-all duration-300 hover:bg-white/[0.04]">
                        <h3 className="font-extrabold text-xl text-white mb-2">Up to 12 Months Warranty</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            We stand behind our work. Every doorstep repair and pre-owned device purchase is protected by our secure, worry-free warranty.
                        </p>
                    </div>
                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden transition-all duration-300 hover:bg-white/[0.04]">
                        <h3 className="font-extrabold text-xl text-white mb-2">100% Certified Data Shield</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Your data privacy is our highest priority. We use industry-standard formatting protocols to ensure complete data wiping on refurbished trades.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
