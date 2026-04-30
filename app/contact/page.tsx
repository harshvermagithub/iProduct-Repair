'use client';

import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
            <h1 className="text-4xl font-bold text-center mb-12 text-green-700 dark:text-green-500">Contact Us</h1>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Contact Info */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">Get in Touch</h2>
                        <p className="text-muted-foreground">Have questions about selling your device? We are here to help.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                                <Phone className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Phone Support</h3>
                                <p className="text-sm text-muted-foreground">+91 90603 36060</p>
                                <p className="text-xs text-muted-foreground mt-1">Mon-Sat, 10am - 7pm</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="mt-1 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                                <Mail className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Email Us</h3>
                                <p className="text-sm text-muted-foreground">connect@fonzkart.in</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="mt-1 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Office</h3>
                                <p className="text-sm text-muted-foreground">
                                    Bangalore, Karnataka, India.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">Name</label>
                                <input type="text" id="name" className="w-full p-2 rounded-md border bg-background" placeholder="Your name" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                                <input type="tel" id="phone" className="w-full p-2 rounded-md border bg-background" placeholder="Your phone" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <input type="email" id="email" className="w-full p-2 rounded-md border bg-background" placeholder="your@email.com" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-medium">Message</label>
                            <textarea id="message" rows={4} className="w-full p-2 rounded-md border bg-background resize-none" placeholder="How can we help?"></textarea>
                        </div>
                        <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-md flex items-center justify-center gap-2 transition-colors">
                            <Send className="w-4 h-4" /> Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
