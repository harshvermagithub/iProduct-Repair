import React from 'react';

export const FLogo = ({ className }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 60 100"
            fill="currentColor"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
        >
            {/* 
                Refined Matching F Logo
                - Gaps are swooping UP (Leaf-like).
                - Segments are SOLID white blocks.
                - Top Block: Large, leaf-like.
                - Middle Block: Medium, leaf-like.
                - Bottom Block: Stem-like.
            */}

            {/* TOP SEGMENT: Leaf shape pointing right */}
            <path d="M 0 0 L 60 0 L 60 15 C 60 25 45 25 40 25 C 20 25 10 32 0 35 L 0 0 Z" />

            {/* MIDDLE SEGMENT: Leaf shape pointing right */}
            <path d="M 0 45 C 10 40 20 35 40 35 L 50 35 L 50 50 C 50 60 35 60 30 60 C 15 60 5 65 0 70 L 0 45 Z" />

            {/* BOTTOM SEGMENT: Stem shape */}
            <path d="M 0 80 C 5 75 10 75 15 75 L 15 90 C 15 100 0 100 0 100 L 0 80 Z" />

        </svg>
    );
};
