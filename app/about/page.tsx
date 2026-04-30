import React from 'react';
import { FCartLogo } from '@/components/FCartLogo';

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-16 md:py-24 space-y-12 max-w-4xl">
            <section className="space-y-6 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-green-700 dark:text-green-500 flex items-center justify-center gap-4 flex-wrap">
                    <span>About</span>
                    <FCartLogo size={70} />
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Reinventing the way you sell your old gadgets. Simple, Fast, and Secure.
                </p>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-bold">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                    At Fonzkart, we believe that selling your used electronics should be as easy as buying new ones.
                    We are dedicated to providing a seamless, transparent, and rewarding experience for our customers.
                    Our mission is to reduce e-waste by extending the lifecycle of gadgets while putting instant cash in your pocket.
                </p>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-bold">Why Choose Us?</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-card rounded-xl border shadow-sm">
                        <h3 className="font-semibold text-lg mb-2">Instant Quotes</h3>
                        <p className="text-sm text-muted-foreground">Get the best price for your device in seconds with our AI-driven pricing engine.</p>
                    </div>
                    <div className="p-6 bg-card rounded-xl border shadow-sm">
                        <h3 className="font-semibold text-lg mb-2">Free Doorstep Pickup</h3>
                        <p className="text-sm text-muted-foreground">Our evaluation expert comes to your location to check the device and pick it up.</p>
                    </div>
                    <div className="p-6 bg-card rounded-xl border shadow-sm">
                        <h3 className="font-semibold text-lg mb-2">Instant Payment</h3>
                        <p className="text-sm text-muted-foreground">Receive payment immediately via UPI or Cash before we leave with your device.</p>
                    </div>
                    <div className="p-6 bg-card rounded-xl border shadow-sm">
                        <h3 className="font-semibold text-lg mb-2">Safe &amp; Secure</h3>
                        <p className="text-sm text-muted-foreground">We ensure your data is wiped and your device is handled responsibly.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
