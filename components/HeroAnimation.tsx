'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Banknote, ArrowRight, ArrowDown } from 'lucide-react'
import { useState, useEffect } from 'react'

// --- SVGs Definitions (Same as before) ---
const IPhoneSVG = ({ color }: { color: string }) => (
    <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="96" height="196" rx="16" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
        <rect x="6" y="6" width="88" height="188" rx="12" fill={color} />
        <rect x="30" y="8" width="40" height="12" rx="6" fill="#000" />
        <rect x="8" y="8" width="45" height="45" rx="12" fill="transparent" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
        <circle cx="20" cy="20" r="6" fill="#000" />
        <circle cx="40" cy="30" r="6" fill="#000" />
        <circle cx="20" cy="40" r="6" fill="#000" />
    </svg>
)

const SamsungSVG = ({ color }: { color: string }) => (
    <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="96" height="196" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
        <rect x="4" y="4" width="92" height="192" rx="1" fill={color} />
        <circle cx="50" cy="12" r="3" fill="#000" />
        <circle cx="20" cy="20" r="7" fill="#000" stroke="#334155" strokeWidth="1" />
        <circle cx="20" cy="40" r="7" fill="#000" stroke="#334155" strokeWidth="1" />
        <circle cx="20" cy="60" r="7" fill="#000" stroke="#334155" strokeWidth="1" />
        <circle cx="40" cy="30" r="5" fill="#000" stroke="#334155" strokeWidth="1" />
    </svg>
)

const PixelSVG = ({ color }: { color: string }) => (
    <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="96" height="196" rx="10" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
        <rect x="6" y="6" width="88" height="188" rx="8" fill={color} />
        <rect x="2" y="30" width="96" height="25" rx="4" fill="#000" />
        <rect x="15" y="35" width="20" height="15" rx="7" fill="#1e293b" />
        <circle cx="50" cy="42" r="6" fill="#1e293b" />
    </svg>
)

const MacbookSVG = ({ color }: { color: string }) => (
    <svg viewBox="0 0 200 140" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(10, 20)">
            <rect x="0" y="0" width="160" height="100" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="2" />
            <rect x="5" y="5" width="150" height="90" rx="2" fill={color} opacity="0.9" />
            <path d="M70 5 H90 V12 H70 Z" fill="#000" />
            <rect x="5" y="95" width="150" height="5" fill="black" opacity="0.1" />
            <path d="M-10 100 H170 L170 105 C170 108 166 110 160 110 H0 C-6 110 -10 108 -10 105 Z" fill="#94a3b8" />
        </g>
    </svg>
)

const SurfaceSVG = ({ color }: { color: string }) => (
    <svg viewBox="0 0 200 140" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(20, 10)">
            <rect x="0" y="0" width="140" height="100" rx="2" fill={color} stroke="#334155" strokeWidth="2" />
            <rect x="5" y="5" width="130" height="90" fill="#0f172a" />
            <path d="M-10 100 H150 L160 115 H-20 Z" fill="#334155" />
        </g>
    </svg>
)

const IPadSVG = ({ color }: { color: string }) => (
    <svg viewBox="0 0 150 200" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="5" width="140" height="190" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <rect x="12" y="12" width="126" height="176" rx="4" fill={color} />
        <rect x="135" y="20" width="4" height="30" rx="2" fill="#334155" />
        <circle cx="75" cy="180" r="1.5" fill="#fff" opacity="0.5" />
    </svg>
)

const GalaxyTabSVG = ({ color }: { color: string }) => (
    <svg viewBox="0 0 200 140" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(10, 20)">
            <rect x="0" y="0" width="180" height="110" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <rect x="8" y="8" width="164" height="94" rx="3" fill={color} />
            <circle cx="90" cy="6" r="2" fill="#000" />
        </g>
    </svg>
)

const WatchUltraSVG = ({ color }: { color: string }) => (
    <svg viewBox="0 0 150 200" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 0 H100 V60 H50 Z" fill={color} />
        <path d="M50 140 H100 V200 H50 Z" fill={color} />
        <rect x="30" y="40" width="90" height="110" rx="15" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="4" />
        <rect x="36" y="46" width="78" height="98" rx="8" fill="#000" />
        <rect x="120" y="70" width="6" height="20" rx="2" fill="#f97316" />
    </svg>
)

const WatchRoundSVG = ({ color }: { color: string }) => (
    <svg viewBox="0 0 150 200" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
        <path d="M55 10 H95 V60 H55 Z" fill={color} />
        <path d="M55 140 H95 V190 H55 Z" fill={color} />
        <circle cx="75" cy="100" r="45" fill="#1e293b" stroke="#334155" strokeWidth="4" />
        <circle cx="75" cy="100" r="38" fill="#000" />
    </svg>
)

const CameraSVG = ({ color }: { color: string }) => (
    <svg viewBox="0 0 200 160" className="w-full h-full drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(10, 30)">
            <rect x="20" y="0" width="140" height="100" rx="8" fill={color} stroke="#334155" strokeWidth="2" />
            <rect x="60" y="-15" width="60" height="15" rx="4" fill="#334155" />
            <circle cx="90" cy="50" r="35" fill="#0f172a" stroke="#475569" strokeWidth="4" />
            <circle cx="90" cy="50" r="25" fill="#1e1e1e" />
            <circle cx="95" cy="45" r="8" fill="#fff" opacity="0.3" />
            <rect x="130" y="5" width="20" height="10" rx="2" fill="#ef4444" />
        </g>
    </svg>
)

// --- Data Structure ---
const DEFAULT_GROUPS = [
    {
        id: "phones",
        name: "Smartphones",
        value: "₹129k+",
        items: [
            { type: "pixel", color: "#fef3c7", Component: PixelSVG, rotate: -20, x: -35, y: 15 },
            { type: "iphone", color: "#475569", Component: IPhoneSVG, rotate: 15, x: 30, y: -5 },
            { type: "samsung", color: "#d1d5db", Component: SamsungSVG, rotate: 0, x: 0, y: -20 },
        ]
    },
    {
        id: "tablets",
        name: "Tablets",
        value: "₹120k+",
        items: [
            { type: "ipad-mini", color: "#fca5a5", Component: IPadSVG, rotate: -15, x: -25, y: 10 },
            { type: "galaxy-tab", color: "#93c5fd", Component: GalaxyTabSVG, rotate: 10, x: 35, y: 15 },
            { type: "ipad-pro", color: "#e2e8f0", Component: IPadSVG, rotate: -5, x: 0, y: -10 },
        ]
    },
    {
        id: "laptops",
        name: "Laptops",
        value: "₹149k+",
        items: [
            { type: "surface", color: "#cbd5e1", Component: SurfaceSVG, rotate: 12, x: 25, y: 5 },
            { type: "macbook-dark", color: "#334155", Component: MacbookSVG, rotate: -12, x: -25, y: 5 },
            { type: "macbook-pro", color: "#94a3b8", Component: MacbookSVG, rotate: 0, x: 0, y: -15 },
        ]
    },
    {
        id: "watches",
        name: "Watches",
        value: "₹65k+",
        items: [
            { type: "round", color: "#3b82f6", Component: WatchRoundSVG, rotate: 20, x: 35, y: 5 },
            { type: "series", color: "#f87171", Component: WatchUltraSVG, rotate: -20, x: -35, y: 15 },
            { type: "ultra", color: "#f97316", Component: WatchUltraSVG, rotate: 0, x: 0, y: -10 },
        ]
    },
    {
        id: "cameras",
        name: "Cameras",
        value: "₹1.2L+",
        items: [
            { type: "mirrorless", color: "#334155", Component: CameraSVG, rotate: -10, x: -20, y: 10 },
            { type: "dslr", color: "#1e293b", Component: CameraSVG, rotate: 10, x: 20, y: -5 },
            { type: "pro", color: "#0f172a", Component: CameraSVG, rotate: 0, x: 0, y: -15 },
        ]
    }
]

export default function HeroAnimation({ displayPrices = [] }: { displayPrices?: any[] }) {
    const [currentIndex, setCurrentIndex] = useState(0)

    // Map dynamic prices to groups
    const groups = DEFAULT_GROUPS.map(g => {
        const custom = displayPrices.find(p => p.categoryKey === g.id);
        if (custom && custom.displayPrice) {
            return { ...g, value: custom.displayPrice };
        }
        return g;
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % groups.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [groups.length])

    const group = groups[currentIndex] || groups[0];

    return (
        <div className="relative w-full h-full flex flex-row items-center justify-center overflow-visible">
            {/* Background Glow */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="absolute w-64 h-64 md:w-96 md:h-96 bg-green-500/10 rounded-full blur-[80px]" />
            </div>

            {/* Container: Vertical stack on Mobile, Horizontal on Desktop */}
            <div className="relative z-10 flex flex-row items-center justify-center gap-4 sm:gap-12 w-full max-w-5xl px-0 origin-center transition-transform duration-300 scale-[0.55] sm:scale-100 mt-16 sm:mt-0">

                {/* 1. DEVICE STACK */}
                <div className="relative w-64 h-64 sm:w-64 sm:h-72 shrink-0 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={group.id}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            {/* Render Items */}
                            {group.items.map((item, index) => {
                                const ItemComponent = item.Component;
                                return (
                                    <motion.div
                                        key={`${group.id}-${index}`}
                                        initial={{
                                            x: 0,
                                            y: -50,
                                            opacity: 0,
                                            rotate: 0
                                        }}
                                        animate={{
                                            x: item.x,
                                            y: item.y,
                                            opacity: 1,
                                            rotate: item.rotate,
                                            zIndex: index
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 100,
                                            damping: 15,
                                            delay: index * 0.15
                                        }}
                                        className={`absolute flex items-center justify-center drop-shadow-2xl ${group.id === 'tablets' || group.name === 'Laptops' || group.name === 'Cameras' ? 'w-48 h-32' : 'w-32 h-64'}`}
                                    >
                                        <ItemComponent color={item.color} />
                                    </motion.div>
                                )
                            })}
                        </motion.div>
                    </AnimatePresence>

                    {/* Category Label */}
                    <div className="absolute -bottom-4 md:-bottom-10 left-0 right-0 text-center z-20">
                        <motion.div
                            key={`label-${group.id}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block bg-white/90 backdrop-blur px-5 py-2 rounded-full shadow-lg border border-slate-100"
                        >
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-widest whitespace-nowrap">{group.name}</span>
                        </motion.div>
                    </div>
                </div>

                {/* 2. MIDDLE: ARROW (Rotates for Mobile) */}
                <div className="relative z-30 shrink-0 mx-4">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border border-green-100 flex items-center justify-center shadow-lg"
                    >
                        {/* Always use Right Arrow now that it's horizontal */}
                        <div className="block">
                            <ArrowRight className="text-green-600 w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                    </motion.div>
                </div>

                {/* 3. RIGHT SIDE: CASH STACK */}
                <div className="relative w-48 h-40 sm:h-64 shrink-0 flex flex-col items-center justify-center">
                    <div className="relative w-full h-full sm:h-48 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`cash-${group.id}`}
                                className="absolute inset-0 flex items-center justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {[2, 1, 0].map((offset) => (
                                    <motion.div
                                        key={offset}
                                        initial={{ y: 50, opacity: 0, scale: 0.8 }}
                                        animate={{
                                            y: offset * -15,
                                            opacity: 1,
                                            scale: 1,
                                            rotate: offset * -2
                                        }}
                                        transition={{ delay: offset * 0.1 }}
                                        className="absolute w-32 sm:w-40 h-20 sm:h-24 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 shadow-xl border border-white/20 flex flex-col items-center justify-center z-10"
                                        style={{ top: '40%' }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Banknote className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                                            <span className="text-white font-bold text-base sm:text-lg">{group.value}</span>
                                        </div>
                                        <span className="text-[9px] sm:text-[10px] text-white/60 uppercase tracking-widest mt-1">Instant Cash</span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </div>
    )
}
