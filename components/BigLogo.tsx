'use client';

import React from 'react';
import { HeroLogo } from './HeroLogo';

export const BigLogo = () => {
    return (
        <div className="w-full h-[250px] flex items-center justify-start select-none opacity-90 hover:opacity-100 transition-opacity duration-500 overflow-visible -ml-32 mt-24">
            <div className="relative scale-[1.0] md:scale-[1.2] lg:scale-[1.5] origin-left transform">
                <HeroLogo />
            </div>
        </div>
    );
};
