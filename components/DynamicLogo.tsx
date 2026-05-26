'use client';

import React from 'react';
import { CanvasLogo } from '@/components/CanvasGraphics';

export const DynamicLogo = ({ className = "h-10 w-auto" }: { className?: string }) => {
    return <CanvasLogo className={className} />;
};

export default DynamicLogo;
