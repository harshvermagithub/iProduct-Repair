
import { getSession } from '@/lib/session';
import { isAdmin } from '@/lib/auth-utils';
import { HeaderActionsClient } from './HeaderActionsClient';

export default async function HeaderActions() {
    const session = await getSession();
    const isAdminUser = session ? isAdmin(session.user) : false;

    return (
        <HeaderActionsClient session={session} isAdminUser={isAdminUser} />
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
