import Link from 'next/link';
import { Suspense } from 'react';
import { ThemeToggle } from './theme-toggle';
import { Logo } from './Logo';
import HeaderActions, { HeaderActionsSkeleton } from './HeaderActions';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/5 backdrop-blur-md overflow-visible text-foreground">
            <div className="container mx-auto flex h-16 items-start justify-between px-4 md:px-6 pt-3 overflow-visible">
                <Link href="/" className="flex items-start gap-2 overflow-visible mt-2">
                    <Logo className="w-auto h-full max-h-16 py-1 text-primary" />
                </Link>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Suspense fallback={<HeaderActionsSkeleton />}>
                        <HeaderActions />
                    </Suspense>
                </div>
            </div>
        </header>
    );
}
