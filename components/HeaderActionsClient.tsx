'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, LogOut, Menu, X } from 'lucide-react';
import { NavLinks } from './NavLinks';
import { logout } from '@/actions/auth';

export function HeaderActionsClient({ session, isAdminUser }: { session: any, isAdminUser: boolean }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Desktop View */}
            <div className="hidden md:flex items-center gap-6">
                <NavLinks session={session} isAdminUser={isAdminUser} />
                
                <div className="h-6 w-px bg-white/10 mx-2" />

                {session ? (
                    <div className="flex items-center gap-4">
                        <Link href="/profile" className="flex items-center gap-2 hover:text-primary transition-colors text-sm font-medium">
                            <User className="h-4 w-4" />
                            <span className="text-foreground">Hi, {session.user?.name}</span>
                        </Link>
                        <form action={logout}>
                            <button type="submit" className="flex items-center gap-2 rounded-full border border-input bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors text-foreground">
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
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

            {/* Mobile View Toggle */}
            <div className="md:hidden flex items-center">
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-foreground">
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Dropdown */}
            {isOpen && (
                <div className="absolute top-16 left-0 w-full bg-background/95 backdrop-blur-md border-b border-border shadow-lg p-4 flex flex-col gap-4 md:hidden z-50">
                    <NavLinks session={session} isAdminUser={isAdminUser} />
                    
                    <div className="h-px w-full bg-border" />
                    
                    {session ? (
                        <div className="flex flex-col gap-4">
                            <Link onClick={() => setIsOpen(false)} href="/profile" className="flex items-center gap-2 hover:text-primary transition-colors text-sm font-medium">
                                <User className="h-4 w-4" />
                                <span className="text-foreground">Hi, {session.user?.name}</span>
                            </Link>
                            <form action={logout}>
                                <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full border border-input bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors text-foreground">
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </button>
                            </form>
                        </div>
                    ) : (
                        <Link onClick={() => setIsOpen(false)} href="/login" className="w-full">
                            <button className="flex w-full justify-center items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
                                <User className="h-4 w-4" />
                                Login
                            </button>
                        </Link>
                    )}
                </div>
            )}
        </>
    );
}
