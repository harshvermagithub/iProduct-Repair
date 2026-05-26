import React from 'react';
import Link from 'next/link';

export default function SitemapPage() {
    return (
        <div className="container mx-auto px-6 py-16 md:py-24 max-w-4xl space-y-12 text-slate-100">
            <h1 className="text-3xl md:text-4xl font-black mb-8 text-white">Sitemap</h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                <div className="space-y-4">
                    <h2 className="text-xl font-bold border-b border-white/5 pb-2 text-blue-500">iProduct Services</h2>
                    <ul className="space-y-2 text-slate-400 font-medium">
                        <li><Link href="/sell?category=repair" className="hover:text-blue-400 transition-colors">iPhone Doorstep Repair</Link></li>
                        <li><Link href="/sell?category=repair" className="hover:text-blue-400 transition-colors">MacBook Doorstep Repair</Link></li>
                        <li><Link href="/sell?category=repair" className="hover:text-blue-400 transition-colors">iPad Technical Care</Link></li>
                        <li><Link href="/sell?category=repair" className="hover:text-blue-400 transition-colors">Apple Watch Service</Link></li>

                        <li><Link href="/shop" className="hover:text-blue-400 transition-colors">Shop Certified Renewed</Link></li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold border-b border-white/5 pb-2 text-blue-500">Company</h2>
                    <ul className="space-y-2 text-slate-400 font-medium">
                        <li><Link href="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
                        <li><Link href="/how-it-works" className="hover:text-blue-400 transition-colors">How It Works</Link></li>
                        <li><Link href="/careers" className="hover:text-blue-400 transition-colors">Careers</Link></li>
                        <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact Us</Link></li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold border-b border-white/5 pb-2 text-blue-500">Legal &amp; Support</h2>
                    <ul className="space-y-2 text-slate-400 font-medium">
                        <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
                        <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Help Center</Link></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
