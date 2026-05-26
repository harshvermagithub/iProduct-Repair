'use client';

import React from 'react';
import { CanvasLogo } from '@/components/CanvasGraphics';

export const HeroLogo = ({ className = "", forceLight = false }: { className?: string, forceLight?: boolean }) => {
    return <CanvasLogo className={className} />;
};

export default HeroLogo;
