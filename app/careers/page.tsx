import React from 'react';
import { Briefcase } from 'lucide-react';

export default function CareersPage() {
    return (
        <div className="container mx-auto px-6 py-20 md:py-32 max-w-4xl space-y-12">
            <section className="text-center space-y-6">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">Join Team iProduct Repair</h1>
                <p className="text-xl text-slate-400 font-light">Build the future of premium Apple technical care with us.</p>
            </section>

            <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-12 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-slate-900 border border-white/10 rounded-full flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">No Openings Currently</h2>
                <p className="text-slate-400 max-w-md mx-auto leading-relaxed text-sm font-medium">
                    We are not actively hiring at the moment, but we are always looking for talented hardware engineers and operations experts.
                </p>
                <p className="text-sm text-slate-500">
                    Drop your CV at <span className="font-bold text-blue-500 hover:underline cursor-pointer">careers@iproductrepair.com</span>
                </p>
            </section>
        </div>
    );
}
