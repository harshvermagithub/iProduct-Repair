import React from 'react';
import HowItWorks from '@/components/HowItWorks';

export default function HowItWorksPage() {
    return (
        <div className="pt-8 pb-16">
            <div className="container mx-auto px-4 mb-12 text-center">
                <h1 className="text-4xl font-bold mb-4 text-green-700 dark:text-green-500">How It Works</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Selling your gadget is handled in 3 simple steps. Here is how we do it.
                </p>
            </div>
            <HowItWorks />
        </div>
    );
}
