'use client'

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export const Logo = ({ className = "h-14 w-auto" }: { className?: string }) => {
    return (
        <div className={`relative flex items-end justify-center overflow-visible pt-1 pb-1 px-1 ${className}`} aria-label="Fonzkart">
            {/* The Cart Container - Tilted Left */}
            <div className="relative -rotate-3 origin-bottom-right">
                {/* Content Inside the Cart - Scaled Down & Raised to float inside */}
                <div className="absolute bottom-[35%] left-1/2 -translate-x-[45%] flex flex-col items-center leading-none z-10 w-full text-center pb-0 scale-[0.85]">

                    {/* Top Row: F inside Phone + ONZ */}
                    <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        {/* F Logo Box */}
                        <div
                            className="relative w-4 h-6 flex items-center justify-center rounded-[3px] border border-slate-700 dark:border-white/20 shadow-inner overflow-hidden transition-colors duration-300 bg-black"
                        >
                            <motion.div
                                animate={{ opacity: [1, 0, 1, 0, 1, 1, 0.2, 1] }}
                                transition={{
                                    duration: 2.5,
                                    repeat: Infinity,
                                    times: [0, 0.1, 0.2, 0.3, 0.4, 0.8, 0.9, 1]
                                }}
                                className="w-[85%] h-[85%] rounded-[1px] bg-green-500 overflow-hidden relative"
                            >
                                <Image src="/logo_final_v3.png" alt="F" fill className="object-cover" />
                            </motion.div>
                        </div>

                        <span
                            className="font-black text-lg tracking-tighter transition-colors duration-300"
                            style={{ color: 'var(--logo-text)' }}
                        >
                            ONZ
                        </span>
                    </div>

                    {/* Bottom Row: KA + Cash/Rupee + T */}
                    <div className="flex items-center justify-center gap-0.5">
                        <span
                            className="font-bold text-xs tracking-tight transition-colors duration-300"
                            style={{ color: 'var(--logo-ka-t-color)' }}
                        >
                            KA
                        </span>

                        {/* R replacement: 500 Rupee Note */}
                        <div className="relative w-3.5 h-5 bg-emerald-50 dark:bg-emerald-950 rounded-[2px] border border-emerald-600 dark:border-emerald-400 flex items-center justify-center shadow-sm -mt-0.5 overflow-hidden">
                            <span className="absolute top-[0.5px] left-[1px] text-[2px] font-bold text-emerald-800 dark:text-emerald-300">500</span>
                            <motion.span
                                animate={{ opacity: [1, 0, 1, 0, 1, 1, 0.2, 1] }}
                                transition={{
                                    duration: 2.5,
                                    repeat: Infinity,
                                    times: [0, 0.1, 0.2, 0.3, 0.4, 0.8, 0.9, 1]
                                }}
                                className="text-[6px] text-emerald-800 dark:text-emerald-300 font-bold"
                            >
                                ₹
                            </motion.span>
                        </div>


                        <span
                            className="font-bold text-xs tracking-tight transition-colors duration-300"
                            style={{ color: 'var(--logo-ka-t-color)' }}
                        >
                            T
                        </span>
                    </div>
                </div>

                {/* Custom Shopping Cart Graphic (Elongated & Open Top) -> NextGen Animated Version */}
                <motion.svg
                    width="80"
                    height="70"
                    viewBox="0 0 28 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-[0_0_12px_rgba(34,197,94,0.6)]"
                    style={{ overflow: 'visible' }}
                    animate={{ y: [0, -1.5, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    {/* Glowing background inside the cart basket */}
                    <motion.polygon
                        points="6,15 9,16 22,16 24.5,10 6.5,10"
                        className="fill-green-500/10 dark:fill-green-400/15"
                    />

                    {/* Speed / Energy Trails Behind Cart */}
                    <motion.path d="M-3 15 L2 15" strokeWidth="1" className="stroke-emerald-500/60 dark:stroke-emerald-400/60" animate={{ x: [-4, 4, -4], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }} strokeLinecap="round" />
                    <motion.path d="M0 11 L3 11" strokeWidth="1" className="stroke-teal-500/60 dark:stroke-teal-400/60" animate={{ x: [-2, 5, -2], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} strokeLinecap="round" />

                    {/* Wheels */}
                    <motion.circle cx="9" cy="20" r="1.2" className="stroke-green-600 dark:stroke-green-400/80" strokeWidth="1.5" />
                    <motion.circle cx="22" cy="20" r="1.2" className="stroke-green-600 dark:stroke-green-400/80" strokeWidth="1.5" />

                    {/* Wheel inner glowing dot */}
                    <motion.circle cx="9" cy="20" r="0.4" className="fill-green-400 dark:fill-green-300" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} />
                    <motion.circle cx="22" cy="20" r="0.4" className="fill-green-400 dark:fill-green-300" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} />

                    {/* Elongated Cart Body */}
                    <motion.path
                        d="M1 1H4L6.68 14.39C6.8872 15.4284 7.79848 16.1782 8.85764 16.18H22.4182C23.4024 16.18 24.2721 15.5255 24.55 14.58L26 9"
                        className="stroke-green-600 dark:stroke-green-400"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Cart front accent line glowing pulse */}
                    <motion.path
                        d="M8.85764 16.18H22.4182C23.4024 16.18 24.2721 15.5255 24.55 14.58L26 9"
                        className="stroke-lime-400"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Floating neon particles above cart */}
                    <motion.circle cx="26" cy="3" r="0.75" className="fill-emerald-400" animate={{ y: [0, -4, 0], opacity: [0, 1, 0] }} transition={{ duration: 2.5, repeat: Infinity }} />
                    <motion.circle cx="22" cy="6" r="0.6" className="fill-lime-400" animate={{ y: [0, -3, 0], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.8 }} />
                </motion.svg>
            </div >
        </div >
    );
};

export default Logo;
