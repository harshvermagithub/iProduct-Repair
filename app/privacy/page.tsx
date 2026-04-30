import React from 'react';

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl space-y-8">
            <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

            <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                <p>Last Updated: {new Date().toLocaleDateString()}</p>

                <h3 className="text-foreground font-semibold text-lg">1. Information We Collect</h3>
                <p>We collect information you provide directly to us, such as your name, email address, phone number, and device details when you use our service.</p>

                <h3 className="text-foreground font-semibold text-lg">2. How We Use Your Information</h3>
                <p>We use your information to provide, maintain, and improve our services, process transactions, and communicate with you.</p>

                <h3 className="text-foreground font-semibold text-lg">3. Data Security</h3>
                <p>We implement appropriate security measures to protect your personal information.</p>

                <h3 className="text-foreground font-semibold text-lg">4. Sharing of Information</h3>
                <p>We do not sell your personal information. We may share information with service providers who help us run our business (e.g., logistics partners).</p>
            </div>
        </div>
    );
}
