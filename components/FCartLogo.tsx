'use client';

import React from 'react';
import { CanvasLogo } from '@/components/CanvasGraphics';

export const FCartLogo = ({
    className = '',
    size = 80,
    animate = true,
}: {
    className?: string;
    size?: number;
    animate?: boolean;
}) => {
    return <CanvasLogo className={className} />;
};

export default FCartLogo;
