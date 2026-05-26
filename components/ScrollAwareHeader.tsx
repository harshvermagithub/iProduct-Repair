'use client';

import { useEffect, useState } from 'react';

export function ScrollAwareHeader({ children }: { children: React.ReactNode }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // run on mount
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`sticky top-0 z-50 w-full transition-all duration-500 overflow-visible text-foreground ${
                scrolled
                    ? 'border-b border-slate-200/80 dark:border-white/8 bg-white/88 dark:bg-slate-950/90 backdrop-blur-xl shadow-sm dark:shadow-black/20'
                    : 'border-b border-transparent bg-white/60 dark:bg-transparent backdrop-blur-md'
            }`}
        >
            {children}
        </header>
    );
}
