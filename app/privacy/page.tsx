import React from 'react';

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-6 py-20 md:py-32 max-w-4xl space-y-8">
            <h1 className="text-4xl font-black mb-8 text-white">Privacy Policy</h1>

            <div className="space-y-6 text-slate-400 text-sm leading-relaxed font-medium">
                <p>Last Updated: {new Date().toLocaleDateString()}</p>

                <h3 className="text-white font-bold text-lg">1. Information We Collect</h3>
                <p>We collect information you provide directly to us, such as your name, email address, phone number, and device specifications when booking doorstep Apple repairs or requesting pricing quotes on certified pre-owned gadgets.</p>

                <h3 className="text-white font-bold text-lg">2. How We Use Your Information</h3>
                <p>We use your information to coordinate and process onsite repair orders, assign field engineers, fulfill refurbished device shipments, handle invoices, and communicate support notifications with you.</p>

                <h3 className="text-white font-bold text-lg">3. Data Security &amp; Certified wiping</h3>
                <p>We implement state-of-the-art security measures to protect your personal information. When repairing or trading refurbished devices, we apply certified data scrubbing algorithms to guarantee that no previous personal remnants remain accessible on the hardware.</p>

                <h3 className="text-white font-bold text-lg">4. Sharing of Information</h3>
                <p>We do not sell your personal information. We may share essential details strictly with our verified in-house technicians or logistics executives solely to facilitate doorstep pickup, diagnostic checkups, or device drop-off services.</p>
            </div>
        </div>
    );
}
