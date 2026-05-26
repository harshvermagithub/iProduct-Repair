import React from 'react';
import HowItWorks from '@/components/HowItWorks';

export default function HowItWorksPage() {
    return (
        <div className="pt-8 pb-16 text-slate-100 bg-black">
            <div className="container mx-auto px-4 mb-12 text-center">
                <h1 className="text-4xl font-black mb-4 text-white">How It Works</h1>
                <p className="text-slate-400 max-w-2xl mx-auto font-medium">
                    Getting doorstep diagnostics, expert Apple repairs, or certified pre-owned gadgets is completely handled in simple, secure steps.
                </p>
            </div>
            <HowItWorks />
        </div>
    );
}
