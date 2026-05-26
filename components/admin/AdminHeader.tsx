"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationBell } from './NotificationBell';
import { Search, UserCircle, LogOut, User, Settings, ChevronDown, Activity, Volume2, VolumeX } from 'lucide-react';
import { useNotifications } from '../NotificationProvider';
import { Logo } from '../Logo';
import { logout } from '@/actions/auth';

function AudioAlertToggle() {
    const { audioEnabled, setAudioEnabled } = useNotifications();
    return (
        <button 
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                audioEnabled 
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-lg shadow-emerald-500/5' 
                    : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
            }`}
        >
            <Activity className={`w-3 h-3 ${audioEnabled ? 'animate-pulse' : ''}`} />
            <span className="hidden xs:inline">{audioEnabled ? 'Buzzer Active' : 'Buzzer Muted'}</span>
            <span className="xs:hidden">{audioEnabled ? 'ON' : 'OFF'}</span>
            {audioEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
        </button>
    );
}

import { ThemeToggle } from '../theme-toggle';

export function AdminHeader({ user }: { user?: { name: string; email: string; role: string } }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="h-16 border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-8 flex-1">
                {/* Logo and Home Link */}
                <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
                    <Logo className="h-10 w-auto text-primary" />
                    <div className="hidden sm:flex flex-col leading-none">
                        <span className="font-black text-xs tracking-tighter text-white">ADMIN</span>
                        <span className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase opacity-80">Workspace</span>
                    </div>
                </Link>

                {/* Search Bar - Retained Design */}
                <div className="max-w-md hidden md:block flex-1 ml-4 text-foreground">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                        <input 
                            type="text"
                            placeholder="Search records..." 
                            className="w-full pl-10 h-10 bg-white/5 border border-white/10 focus:border-emerald-500/50 outline-none transition-all rounded-xl text-sm text-foreground"
                        />
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4 ml-auto">
                <ThemeToggle />
                
                <AudioAlertToggle />
                
                {/* Test Alert Button */}
                <button 
                  onClick={async () => {
                    if (typeof Notification !== 'undefined') {
                      if (Notification.permission === 'granted') {
                        new window.Notification("Verification Signal Sent!", {
                          body: "Real-time sync test successful.",
                          icon: '/icon.png'
                        });
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                        audio.play().catch(() => {});
                      }
                    }
                    const { createNotification } = await import('@/actions/notifications');
                    await createNotification({
                        title: "DB Heartbeat",
                        message: "Synchronized.",
                        type: "info"
                    });
                  }}
                  className="hidden xs:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 transition-all"
                >
                  <span className="opacity-70">Pulse</span>
                </button>

                {/* Notification Bell */}
                <NotificationBell />
                
                <div className="h-8 w-px bg-white/10 mx-1" />
                
                {/* Account Dropdown */}
                <div className="relative" ref={menuRef}>
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`flex items-center gap-2 p-1 pr-2 rounded-full transition-all group outline-none ${isMenuOpen ? 'bg-white/10' : 'hover:bg-white/5'}`}
                    >
                        <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-2 ring-white/10 group-hover:ring-emerald-500/50 transition-all">
                            <UserCircle className="h-6 w-6" />
                        </div>
                        <div className="hidden lg:flex flex-col items-start leading-none gap-0.5">
                             <span className="text-[10px] font-black text-white/50 uppercase tracking-tighter">{user?.role?.replace('_', ' ') || 'User'}</span>
                             <span className="text-xs font-bold text-white max-w-[100px] truncate">{user?.name || 'Account'}</span>
                        </div>
                        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 backdrop-blur-xl z-50"
                            >
                                <div className="px-4 py-3 border-b border-white/5 mb-2">
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Authenticated Account</p>
                                    <p className="text-sm font-bold text-white truncate">{user?.name || 'Administrator'}</p>
                                    <p className="text-[10px] text-white/40 truncate">{user?.email}</p>
                                </div>

                                <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                                    <User className="w-4 h-4 text-emerald-500" />
                                    <span>My Profile</span>
                                </Link>

                                <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                                    <Settings className="w-4 h-4 text-emerald-500" />
                                    <span>Settings</span>
                                </Link>

                                <div className="h-px bg-white/5 my-2" />

                                <form action={logout}>
                                    <button 
                                        type="submit"
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout Session</span>
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
