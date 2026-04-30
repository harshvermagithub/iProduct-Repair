import React from 'react';
import { Briefcase } from 'lucide-react';

export default function CareersPage() {
    return (
        <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl space-y-12">
            <section className="text-center space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold text-green-700 dark:text-green-500">Join Team Fonzkart</h1>
                <p className="text-xl text-muted-foreground">Build the future of re-commerce with us.</p>
            </section>

            <section className="bg-card border rounded-2xl p-12 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-slate-500" />
                </div>
                <h2 className="text-2xl font-bold">No Openings Currently</h2>
                <p className="text-muted-foreground">
                    We are not actively hiring at the moment, but we are always looking for talented individuals.
                    Drop your CV at <span className="font-semibold text-green-600">careers@fonzkart.in</span>
                </p>
            </section>
        </div>
    );
}
