'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const F_Icon = () => (
    <div className="relative w-5 h-8 flex items-center justify-center rounded-[4px] border border-slate-700 dark:border-white/20 shadow-inner overflow-hidden bg-black mr-0.5">
        <div className="w-[90%] h-[90%] rounded-[2px] bg-green-500 relative overflow-hidden">
            <Image src="/logo_final_v3.png" alt="F" fill className="object-cover" />
        </div>
    </div>
);

const CartIcon = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-emerald-500 overflow-visible">
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="21" r="1" fill="currentColor" />
        <circle cx="20" cy="21" r="1" fill="currentColor" />
    </svg>
);

const NoteIcon = () => (
    <div className="w-5 h-3 bg-green-600 border border-green-300 rounded-[1px] flex items-center justify-center shadow-sm relative rotate-12">
        <div className="w-2 h-2 rounded-full bg-green-400 opacity-50" />
    </div>
);

export const DynamicLogo = ({ className = "" }: { className?: string }) => {
    const [isCartMode, setIsCartMode] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsCartMode(prev => !prev);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`flex items-center font-black text-2xl tracking-tighter ${className}`} aria-label="Fonzkart">
            <F_Icon />
            <span className="text-foreground">ONZ</span>

            {/* K A R T Animation Container */}
            <div className="flex items-center relative h-8 ml-0.5">
                <AnimatePresence mode="popLayout" initial={false}>
                    {/* K or Cart */}
                    <motion.div
                        layout
                        key={isCartMode ? "cart" : "k"}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.4 }}
                        className="flex items-center justify-center"
                    >
                        {isCartMode ? (
                            <div className="relative pt-1">
                                <CartIcon />
                                {/* Note Inside Cart */}
                                <motion.div
                                    initial={{ y: -15, opacity: 0, scale: 0.5, rotate: 0 }}
                                    animate={{ y: 0, opacity: 1, scale: 1, rotate: 12 }}
                                    transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
                                    className="absolute top-[6px] left-[6px]"
                                >
                                    <NoteIcon />
                                </motion.div>
                            </div>
                        ) : (
                            <span className="text-foreground">K</span>
                        )}
                    </motion.div>

                    {/* A */}
                    {!isCartMode && (
                        <motion.span
                            layout
                            key="a"
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-foreground overflow-hidden whitespace-nowrap flex"
                        >
                            A
                        </motion.span>
                    )}

                    {/* R (Rupee) */}
                    {!isCartMode && (
                        <motion.div
                            layout
                            key="r"
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-green-600 flex items-center justify-center font-bold text-xl px-0.5 overflow-hidden whitespace-nowrap"
                        >
                            ₹
                        </motion.div>
                    )}

                    {/* T */}
                    {!isCartMode && (
                        <motion.span
                            layout
                            key="t"
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-foreground overflow-hidden whitespace-nowrap flex"
                        >
                            T
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default DynamicLogo;
