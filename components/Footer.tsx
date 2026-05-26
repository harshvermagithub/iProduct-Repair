import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function Footer() {
    return (
        <footer className="w-full border-t bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 pt-16 pb-8 border-slate-200 dark:border-white/5">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-0.5 scale-95 origin-left">
                            <Logo />
                        </Link>
                        <p className="text-sm leading-relaxed text-slate-500">
                            Bangalore&apos;s premium Apple Service Center offering professional doorstep repairs & certified high-quality pre-owned devices at unbeatable cheap prices.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <Link href="https://www.facebook.com/iproductrepair/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href="https://twitter.com/iproduct_repair" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="https://www.instagram.com/iproductrepair/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="https://www.linkedin.com/company/iproduct-repair" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-widest">Our Services</h3>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><Link href="/sell?category=smartphone" className="hover:text-slate-900 dark:hover:text-white transition-colors">iPhone Repair</Link></li>
                            <li><Link href="/sell?category=laptop" className="hover:text-slate-900 dark:hover:text-white transition-colors">MacBook Repair</Link></li>
                            <li><Link href="/sell?category=tablet" className="hover:text-slate-900 dark:hover:text-white transition-colors">iPad Repair</Link></li>
                            <li><Link href="/sell?category=watches" className="hover:text-slate-900 dark:hover:text-white transition-colors">Apple Watch Repair</Link></li>
                            <li><Link href="/sell?category=imac" className="hover:text-slate-900 dark:hover:text-white transition-colors">iMac Repair</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-widest">Company</h3>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><Link href="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">How it Works</Link></li>
                            <li><Link href="/careers" className="hover:text-slate-900 dark:hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="/contact" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact Us</Link></li>
                            <li><Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-widest">Contact Info</h3>
                        <ul className="space-y-3 text-sm text-slate-500">
                            <li className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                <span className="text-slate-700 dark:text-slate-300 font-medium">+91-9845128045</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                <span className="break-all text-slate-700 dark:text-slate-300">support@iproductrepair.com</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                <span className="leading-snug">36/101, Ground Floor, Dhanalaxmi Electronic Building, Maruthi Layout, Marathahalli, Bengaluru, KA 560037</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-slate-200 dark:border-white/5">
                    <p className="text-xs text-slate-600">
                        © {new Date().getFullYear()} iProduct Repair. All rights reserved. Premium Apple Service Center in Bangalore.
                    </p>
                    <div className="flex gap-6 text-xs text-slate-600">
                        <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</Link>
                        <Link href="/sitemap" className="hover:text-slate-900 dark:hover:text-white transition-colors">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
