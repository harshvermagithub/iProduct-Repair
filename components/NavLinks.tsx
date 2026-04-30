'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
}

export function NavLinks({ session, isAdminUser }: { session: any, isAdminUser: boolean }) {
    const pathname = usePathname();

    const links = [
        { href: '/sell', label: 'Check Price' },
        { href: '/orders', label: 'My Orders' },
    ];

    if (session && isAdminUser) {
        links.push({ href: '/admin', label: 'Admin Panel' });
    }

    return (
        <div className="flex items-center gap-6">
            {links.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`relative py-2 text-sm font-medium transition-all duration-300 hover:text-primary ${
                            isActive ? 'text-primary' : 'text-muted-foreground'
                        }`}
                    >
                        {link.label}
                        {isActive && (
                            <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                        )}
                    </Link>
                );
            })}
        </div>
    );
}
