import React from 'react';

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl space-y-8">
            <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

            <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                <p>Last Updated: {new Date().toLocaleDateString()}</p>

                <h3 className="text-foreground font-semibold text-lg">1. Acceptance of Terms</h3>
                <p>By accessing or using Fonzkart, you agree to be bound by these Terms of Service.</p>

                <h3 className="text-foreground font-semibold text-lg">2. Services</h3>
                <p>Fonzkart provides a platform for users to sell used electronic gadgets. We offer instant quotes and doorstep pickup services.</p>

                <h3 className="text-foreground font-semibold text-lg">3. Valuation</h3>
                <p>The price quote provided on the website is based on the details you provide. The final price is subject to physical inspection by our agent. If the condition differs, a re-quote may be offered.</p>

                <h3 className="text-foreground font-semibold text-lg">4. User Obligations</h3>
                <p>You warrant that you are the legal owner of the device you are selling and that it is free from any liens or encumbrances.</p>

                <h3 className="text-foreground font-semibold text-lg">5. Data Privacy</h3>
                <p>You agree that you are responsible for wiping all personal data from your device before handing it over. While we perform data wiping, we are not liable for any data loss.</p>
            </div>
        </div>
    );
}
