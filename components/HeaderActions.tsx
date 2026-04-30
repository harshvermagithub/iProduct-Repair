
import Link from 'next/link';
import { User, LogOut } from 'lucide-react';
import { getSession, logout } from '@/lib/session';
import { isAdmin } from '@/lib/auth-utils';
import { NavLinks } from './NavLinks';

export default async function HeaderActions() {
    const session = await getSession();
    const isAdminUser = session ? isAdmin(session.user) : false;

    return (
        <div className="flex items-center gap-6">
            <NavLinks session={session} isAdminUser={isAdminUser} />
            
            <div className="h-6 w-px bg-white/10 mx-2 hidden md:block" />

            {session ? (
                <div className="flex items-center gap-4">
                    <Link href="/profile" className="flex items-center gap-2 hover:text-primary transition-colors text-sm font-medium">
                        <User className="h-4 w-4" />
                        <span className="hidden md:inline-block text-foreground">Hi, {session.user?.name}</span>
                    </Link>
                    <form action={logout}>
                        <button type="submit" className="flex items-center gap-2 rounded-full border border-input bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors text-foreground">
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </form>
                </div>
            ) : (
                <Link href="/login">
                    <button className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
                        <User className="h-4 w-4" />
                        Login
                    </button>
                </Link>
            )}
        </div>
    );
}

export function HeaderActionsSkeleton() {
    return (
        <div className="flex items-center gap-6 opacity-50">
            <div className="flex gap-6">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-6 w-px bg-white/10 mx-2 hidden md:block" />
            <div className="h-10 w-24 bg-muted animate-pulse rounded-full" />
        </div>
    );
}
