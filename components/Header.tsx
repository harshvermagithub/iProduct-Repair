import Link from 'next/link';
import { Suspense } from 'react';
import { ThemeToggle } from './theme-toggle';
import { Logo } from './Logo';
import HeaderActions, { HeaderActionsSkeleton } from './HeaderActions';
import { ScrollAwareHeader } from './ScrollAwareHeader';

export default function Header() {
    return (
        <ScrollAwareHeader>
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8 overflow-visible">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 overflow-visible shrink-0">
                    <Logo className="w-auto h-full max-h-14 py-1" />
                </Link>

                {/* Right side actions */}
                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    <div className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                        <ThemeToggle />
                    </div>

                    {/* Divider */}
                    <div className="h-5 w-px bg-slate-200 dark:bg-white/10 mx-1 hidden md:block" />

                    {/* Auth Actions */}
                    <Suspense fallback={<HeaderActionsSkeleton />}>
                        <HeaderActions />
                    </Suspense>
                </div>
            </div>
        </ScrollAwareHeader>
    );
}
