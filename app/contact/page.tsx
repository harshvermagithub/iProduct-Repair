'use client';

import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="container mx-auto px-6 py-20 md:py-32 max-w-5xl">
            <h1 className="text-4xl font-black text-center mb-12 text-white">Contact Us</h1>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Contact Info */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">Get in Touch</h2>
                        <p className="text-slate-400 text-sm leading-relaxed font-medium">Have questions about booking a doorstep repair, checking evaluation quotes, or purchasing a refurbished device? Our technical assistance desk is here to help.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 w-10 h-10 bg-slate-900 border border-white/10 rounded-lg flex items-center justify-center shrink-0">
                                <Phone className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Phone Support</h3>
                                <p className="text-sm text-slate-300 font-bold">+91 98451 28045</p>
                                <p className="text-xs text-slate-500 mt-1">Mon-Sun, 10am - 8pm</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="mt-1 w-10 h-10 bg-slate-900 border border-white/10 rounded-lg flex items-center justify-center shrink-0">
                                <Mail className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Email Us</h3>
                                <p className="text-sm text-slate-300 font-bold">support@iproductrepair.com</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="mt-1 w-10 h-10 bg-slate-900 border border-white/10 rounded-lg flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">iProduct Repair Center</h3>
                                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                    36/101, Ground Floor, Dhanalaxmi Electronic Building, <br />
                                    Maruthi Layout, Marathahalli, Bengaluru, <br />
                                    Karnataka, India - 560037
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 shadow-sm">
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium text-slate-300">Name</label>
                                <input type="text" id="name" className="w-full p-2.5 rounded-xl border border-white/5 bg-slate-950 text-white outline-none focus:border-blue-500 text-sm transition-all" placeholder="Your name" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="phone" className="text-sm font-medium text-slate-300">Phone</label>
                                <input type="tel" id="phone" className="w-full p-2.5 rounded-xl border border-white/5 bg-slate-950 text-white outline-none focus:border-blue-500 text-sm transition-all" placeholder="Your phone" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-slate-300">Email</label>
                            <input type="email" id="email" className="w-full p-2.5 rounded-xl border border-white/5 bg-slate-950 text-white outline-none focus:border-blue-500 text-sm transition-all" placeholder="your@email.com" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-medium text-slate-300">Message</label>
                            <textarea id="message" rows={4} className="w-full p-2.5 rounded-xl border border-white/5 bg-slate-950 text-white outline-none focus:border-blue-500 text-sm transition-all resize-none" placeholder="How can we help?"></textarea>
                        </div>
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                            <Send className="w-4 h-4" /> Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
