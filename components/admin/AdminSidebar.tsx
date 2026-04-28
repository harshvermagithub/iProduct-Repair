'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Smartphone,
    Tablet,
    Watch,
    Laptop,
    Gamepad2,
    Tv,
    Wrench,
    Users,
    ShoppingCart,
    ExternalLink,
    Mail,
    MapPin,
    Briefcase,
    Building2,
    ChevronRight,
    ChevronLeft,
    Camera,
    Monitor,
    Headphones,
    Banknote
} from 'lucide-react';

const CATEGORIES = [
    { id: 'smartphone', label: 'Smartphones', icon: Smartphone },
    { id: 'tablet', label: 'Tablets', icon: Tablet },
    { id: 'watch', label: 'Smartwatches', icon: Watch },
    { id: 'laptop', label: 'Laptops', icon: Laptop },
    { id: 'desktop', label: 'Desktops', icon: Monitor },
    { id: 'earbuds', label: 'Earbuds', icon: Headphones },
    { id: 'console', label: 'Consoles', icon: Gamepad2 },
    { id: 'smarttv', label: 'Smart TV', icon: Tv },
    { id: 'camera', label: 'Camera', icon: Camera },
    { id: 'repair-device', label: 'Repair', icon: Wrench },
];

export default function AdminSidebar({ role = 'SUPER_ADMIN' }: { role?: string }) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);

    const dashboardTitle = role === 'ZONAL_HEAD' ? 'Zonal Head' :
        role === 'RELATIONSHIP_MANAGER' ? 'RM' :
        role === 'FIELD_EXECUTIVE' ? 'Field Executive' :
        ['SUPER_ADMIN', 'ADMIN'].includes(role) ? 'Admin' :
            'Partner';

    const isPrivileged = ['SUPER_ADMIN', 'ADMIN'].includes(role);
    const isZonal = role === 'ZONAL_HEAD';
    const isRM = role === 'RELATIONSHIP_MANAGER';
    const isPartner = role === 'PARTNER';
    const isRider = role === 'FIELD_EXECUTIVE';
    const isMobileOnlyRole = role === 'FIELD_EXECUTIVE';

    const renderLink = (href: string, title: string, Icon: any, isActive: boolean = false, onClickExtra?: () => void) => {
        return (
            <Link
                href={href}
                title={title}
                className={`flex items-center gap-3 text-sm font-medium rounded-lg transition-colors relative ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'
                    } ${isMobileOpen
                        ? 'justify-start px-4 py-3'
                        : isDesktopCollapsed
                            ? 'justify-center p-3'
                            : 'justify-center p-3 lg:justify-start lg:px-4 lg:py-3'
                    }`}
                onClick={() => {
                    setIsMobileOpen(false);
                    if (onClickExtra) onClickExtra();
                }}
            >
                <Icon className="w-5 h-5 shrink-0" />
                <span className={`${isMobileOpen ? 'inline' : isDesktopCollapsed ? 'hidden' : 'hidden lg:inline'} whitespace-nowrap`}>
                    {title}
                </span>
                {isActive && (
                    <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </Link>
        );
    };

    const renderSectionTitle = (title: string) => (
        <div className={`pt-4 pb-2 ${isMobileOpen ? 'text-left' : isDesktopCollapsed ? 'text-center' : 'text-center lg:text-left'}`}>
            <p className={`${isMobileOpen ? 'block' : isDesktopCollapsed ? 'hidden' : 'hidden lg:block'} px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider`}>
                {title}
            </p>
            <div className={`${isMobileOpen ? 'hidden' : isDesktopCollapsed ? 'block' : 'lg:hidden'} h-px bg-border/50 mx-2 my-2`}></div>
        </div>
    );

    return (
        <>
            {/* Mobile Backdrop overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside className={`bg-card dark:bg-black border-r border-border dark:border-white/10 flex flex-col h-[100dvh] sticky top-0 shrink-0 transition-all duration-300 z-30 ${isMobileOpen ? 'w-64 absolute shadow-2xl lg:shadow-none' : isDesktopCollapsed ? 'w-[72px] lg:w-[72px]' : 'w-[72px] lg:w-64'}`}>
                {/* Floating Expand/Collapse Button */}
                <button
                    onClick={() => {
                        if (window.innerWidth >= 1024) {
                            setIsDesktopCollapsed(!isDesktopCollapsed);
                        } else {
                            setIsMobileOpen(!isMobileOpen);
                        }
                    }}
                    className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 bg-primary text-primary-foreground border border-background shadow-md rounded-full flex items-center justify-center z-50 cursor-pointer hover:scale-110 transition-transform"
                    title={isMobileOpen || !isDesktopCollapsed ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                    <div className="lg:hidden flex items-center justify-center">
                        {isMobileOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                    <div className="hidden lg:flex items-center justify-center">
                        {isDesktopCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </div>
                </button>

                <div className={`h-16 border-b border-border dark:border-white/10 shrink-0 flex items-center relative ${isMobileOpen ? 'justify-start px-6' : isDesktopCollapsed ? 'justify-center lg:px-0' : 'justify-center lg:justify-start lg:px-6'}`}>
                    <Link href="/" className={`flex items-center gap-2 font-black text-xl text-foreground tracking-tighter overflow-hidden group`} title="Go to Website">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                            {/* Simplified Icon for Sidebar Top */}
                            <Smartphone className="w-5 h-5" />
                        </div>
                        <span className={`${isMobileOpen ? 'inline' : isDesktopCollapsed ? 'hidden' : 'hidden lg:inline'} whitespace-nowrap`}>Fonz<span className="text-primary font-black">kart</span></span>
                    </Link>
                </div>

                <div className="px-4 pt-4 pb-2 border-b border-white/5 opacity-60">
                     <p className={`${isMobileOpen ? 'block' : isDesktopCollapsed ? 'hidden' : 'hidden lg:block'} text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground`}>
                        {dashboardTitle} Control
                    </p>
                </div>

                <nav className="flex-1 overflow-y-auto px-2 py-4 lg:p-4 space-y-1 scrollbar-hide">
                    {/* Dashboard only for Admins */}
                    {isPrivileged && renderLink('/admin', 'Dashboard', LayoutDashboard, pathname === '/admin')}

                    {/* Inventory Accordion for Admins */}
                    {isPrivileged && (
                        <div className="space-y-1">
                            <button
                                onClick={() => setIsInventoryOpen(!isInventoryOpen)}
                                className={`w-full flex items-center gap-3 text-sm font-medium rounded-lg transition-colors hover:bg-muted text-muted-foreground ${isMobileOpen ? 'px-4 py-3' : isDesktopCollapsed ? 'justify-center p-3' : 'px-4 py-3'}`}
                            >
                                <Smartphone className="w-5 h-5 shrink-0" />
                                <span className={`${isMobileOpen ? 'inline' : isDesktopCollapsed ? 'hidden' : 'hidden lg:inline'} flex-1 text-left`}>Inventory</span>
                                <ChevronRight className={`w-4 h-4 transition-transform ${isInventoryOpen ? 'rotate-90' : ''} ${isMobileOpen || !isDesktopCollapsed ? 'block' : 'hidden'}`} />
                            </button>
                            
                            {(isInventoryOpen && (isMobileOpen || !isDesktopCollapsed)) && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="pl-4 space-y-1 mt-1"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <div key={cat.id}>
                                            {renderLink(
                                                `/admin/category/${cat.id}`, 
                                                cat.label, 
                                                cat.icon, 
                                                pathname === `/admin/category/${cat.id}`,
                                                () => setIsInventoryOpen(false)
                                            )}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </div>
                    )}

                    {isPrivileged && (
                        <>
                            {renderSectionTitle('System')}
                            {renderLink('/admin/admins', 'Users', Users, pathname.includes('/admin/admins'))}
                            {renderLink('/admin/homepage', 'Landing Page', LayoutDashboard, pathname.includes('/admin/homepage'))}
                        </>
                    )}

                    {isRM && (
                        <>
                            {renderSectionTitle('RM Overview')}
                            {renderLink('/admin/rm-dashboard', 'RM Dashboard', LayoutDashboard, pathname.includes('/admin/rm-dashboard'))}
                        </>
                    )}

                    {(isPrivileged || isZonal) && (
                        <>
                            {renderSectionTitle('Hierarchy')}
                            {renderLink('/admin/cities', 'Cities Workspace', MapPin, pathname.includes('/admin/cities'))}
                        </>
                    )}

                    {isPrivileged && (
                        renderLink('/admin/zonal-heads', 'Zonal Heads', Briefcase, pathname.includes('/admin/zonal-heads'))
                    )}

                    {(isPrivileged || isRM || isZonal) && (
                        renderLink('/admin/partners', 'Partners', Building2, pathname.includes('/admin/partners'))
                    )}

                    {renderSectionTitle('Logistics')}
                    {(isPrivileged || isZonal || isRM || isPartner) && renderLink('/admin/riders', 'Field Executives', Users, pathname.includes('riders'))}
                    {renderLink('/admin/orders', (isRider ? 'My Pickups' : 'Orders'), ShoppingCart, pathname.includes('orders'))}

                    {(isPrivileged || isZonal || isRM || isPartner || isRider) && (
                        <>
                            {renderSectionTitle('Communication')}
                            {renderLink('/admin/email', 'Email System', Mail, pathname.includes('/admin/email'))}
                        </>
                    )}

                </nav>

                <div className="p-2 lg:p-4 border-t border-border dark:border-white/10 mt-auto flex flex-col gap-2">
                    {renderLink('/', 'View Website', ExternalLink)}
                </div>
            </aside>
        </>
    );
}
