import React from 'react';

export default function TermsPage() {
    return (
        <div className="container mx-auto px-6 py-20 md:py-32 max-w-4xl space-y-8">
            <h1 className="text-4xl font-black mb-8 text-white">Terms of Service</h1>

            <div className="space-y-6 text-slate-400 text-sm leading-relaxed font-medium">
                <p>Last Updated: {new Date().toLocaleDateString()}</p>

                <h3 className="text-white font-bold text-lg">1. Acceptance of Terms</h3>
                <p>By accessing or using iProduct Repair, you agree to be bound by these Terms of Service.</p>

                <h3 className="text-white font-bold text-lg">2. Services</h3>
                <p>iProduct Repair provides a premium platform for booking doorstep Apple device repairs (iPhone, MacBook, iPad, iMac, Apple Watch) and purchasing certified pre-owned/refurbished electronics. We offer diagnostic checks, instant quotes, doorstep pickups, and refurbished hardware trades backed by warranty.</p>

                <h3 className="text-white font-bold text-lg">3. Valuation &amp; Repair Pricing</h3>
                <p>The repair estimate or purchase price quote provided on the website is based on the details you provide. The final price is subject to physical inspection by our onsite engineers. If the actual condition of the device differs, a re-quote may be offered before service commences.</p>

                <h3 className="text-white font-bold text-lg">4. User Obligations &amp; Device Ownership</h3>
                <p>You warrant that you are the legal owner of the device you are submitting for repair or trade-in and that it is free from any liens, locks, or unlawful encumbrances.</p>

                <h3 className="text-white font-bold text-lg">5. Data Privacy &amp; Backups</h3>
                <p>You agree that you are solely responsible for backing up all personal data from your device prior to handing it over to our technical representatives. While we follow strict data security protocols, we are not liable for any data loss during repairs or diagnostic evaluations.</p>
            </div>
        </div>
    );
}
