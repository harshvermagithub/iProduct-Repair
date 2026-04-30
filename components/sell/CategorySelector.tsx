'use client';

import { motion } from 'framer-motion';

interface CategorySelectorProps {
    onSelect: (category: string) => void;
}

// --- Animated SVG Components ---

const SmartphoneGraphic = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
            <g transform="translate(140, 40) rotate(15)">
                <rect x="0" y="0" width="45" height="90" rx="4" className="fill-blue-100 dark:fill-slate-800 stroke-blue-500" strokeWidth="1.5" />
                <rect x="3" y="3" width="39" height="84" className="fill-blue-200/50 dark:fill-slate-700/50" />
                <path d="M10 20 H35 M10 30 H35 M10 40 H25" className="stroke-blue-500/30" strokeWidth="2" strokeLinecap="round" />
                <circle cx="22" cy="75" r="5" className="fill-blue-500/20" />
                <circle cx="22" cy="25" r="12" className="stroke-blue-500" strokeWidth="1" />
            </g>

            <g transform="translate(100, 30) rotate(0)">
                <rect x="0" y="0" width="50" height="100" rx="8" className="fill-slate-100 dark:fill-slate-800 stroke-slate-500" strokeWidth="1.5" />
                <rect x="3" y="15" width="44" height="80" className="fill-slate-200 dark:fill-slate-700" />
                <rect x="8" y="25" width="34" height="20" rx="2" className="fill-slate-400/20" />
                <rect x="8" y="50" width="34" height="40" rx="2" className="fill-slate-400/20" />
                <rect x="15" y="5" width="20" height="6" rx="3" className="fill-black" />
            </g>

            <g transform="translate(50, 50) rotate(-10)">
                <rect x="0" y="0" width="55" height="110" rx="2" className="fill-white dark:fill-slate-900 stroke-slate-900 dark:stroke-slate-100" strokeWidth="1.5" />
                <rect x="3" y="3" width="49" height="104" className="fill-slate-50 dark:fill-slate-950" />

                <g transform="translate(8, 15)">
                    {/* Animated App Icons */}
                    <motion.rect x="0" y="0" width="10" height="10" rx="2" className="fill-blue-400/70" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.1 }} />
                    <motion.rect x="15" y="0" width="10" height="10" rx="2" className="fill-green-400/70" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
                    <motion.rect x="29" y="0" width="10" height="10" rx="2" className="fill-red-400/70" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
                    <motion.rect x="0" y="15" width="10" height="10" rx="2" className="fill-yellow-400/70" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.2 }} />
                    <motion.rect x="15" y="15" width="10" height="10" rx="2" className="fill-purple-400/70" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.4 }} />
                    <motion.rect x="29" y="15" width="10" height="10" rx="2" className="fill-pink-400/70" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }} />

                    {/* Animated Data Widget */}
                    <rect x="0" y="30" width="39" height="30" rx="2" className="fill-slate-700/20" />
                    <motion.path
                        d="M2 45 Q 10 35, 18 45 T 37 45"
                        className="stroke-blue-500/80 fill-none" strokeWidth="1.5" strokeLinecap="round"
                        animate={{ pathLength: [0, 1, 0], opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.circle cx="10" cy="52" r="2.5" className="fill-green-400" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
                    <motion.circle cx="20" cy="52" r="2.5" className="fill-purple-400" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} />
                    <motion.circle cx="30" cy="52" r="2.5" className="fill-blue-400" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity, delay: 1 }} />
                </g>

                <motion.path
                    d="M0 0 L55 0 L55 110 L0 110 Z"
                    className="fill-white"
                    animate={{ opacity: [0, 0.08, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <path d="M0 0 L55 110" className="stroke-white/20" strokeWidth="40" />
            </g>
        </motion.g>
    </svg>
);

const TabletGraphic = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
            <rect x="80" y="20" width="100" height="130" rx="6" transform="rotate(10 130 85)" className="fill-slate-200 dark:fill-slate-800 stroke-slate-400" strokeWidth="1.5" />

            <g>
                <rect x="20" y="60" width="140" height="90" rx="6" className="fill-white dark:fill-slate-950 stroke-slate-800 dark:stroke-slate-100" strokeWidth="1.5" />
                <rect x="26" y="66" width="128" height="78" className="fill-blue-50 dark:fill-slate-900" />

                <g transform="translate(35, 75)">
                    <rect x="0" y="0" width="30" height="60" rx="2" className="fill-slate-200 dark:fill-slate-800" />
                    <rect x="5" y="10" width="20" height="4" rx="1" className="fill-slate-400" />
                    <rect x="5" y="20" width="20" height="4" rx="1" className="fill-slate-400" />
                    <rect x="5" y="30" width="20" height="4" rx="1" className="fill-slate-400" />

                    {/* Top Hero Section Animated */}
                    <g clipPath="url(#tablet-hero-clip)">
                        <clipPath id="tablet-hero-clip"><rect x="35" y="0" width="70" height="40" rx="2" /></clipPath>
                        <rect x="35" y="0" width="70" height="40" rx="2" className="fill-blue-200 dark:fill-blue-900" />
                        <motion.circle cx="70" cy="20" r="15" className="fill-blue-400/30" animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
                        <motion.circle cx="70" cy="20" r="8" className="fill-blue-500/50" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
                        <motion.path d="M30 30 L45 15 L55 25 L80 5 L110 20" fill="none" className="stroke-teal-400/80" strokeWidth="2" strokeDasharray="100 100" animate={{ strokeDashoffset: [100, -100] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
                    </g>

                    {/* Animated Bottom Grid items */}
                    <motion.rect x="35" y="45" width="20" height="15" rx="2" className="fill-purple-300 dark:fill-purple-800" animate={{ y: [0, -2, 0], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity, delay: 0.1 }} />
                    <motion.rect x="60" y="45" width="20" height="15" rx="2" className="fill-green-300 dark:fill-green-800" animate={{ y: [0, -2, 0], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }} />
                    <motion.rect x="85" y="45" width="20" height="15" rx="2" className="fill-red-300 dark:fill-red-800" animate={{ y: [0, -2, 0], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
                </g>

                <rect x="30" y="155" width="120" height="8" rx="4" className="fill-white stroke-slate-300" />
            </g>
        </motion.g>
    </svg>
);

const WatchGraphic = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
            <g transform="translate(30, 40) rotate(-10)">
                <path d="M25 0 V20 M25 80 V100" className="stroke-slate-300 dark:stroke-slate-700" strokeWidth="40" strokeLinecap="round" />
                <rect x="0" y="20" width="50" height="60" rx="10" className="fill-slate-900 stroke-slate-600" strokeWidth="2" />
                <rect x="5" y="25" width="40" height="50" rx="6" className="fill-black" />

                <circle cx="25" cy="50" r="10" className="stroke-slate-800" strokeWidth="2.5" />
                <motion.circle
                    cx="25" cy="50" r="10"
                    className="stroke-green-500" strokeWidth="2.5"
                    strokeDasharray="45 100"
                    strokeLinecap="round"
                    animate={{ strokeDashoffset: [45, 10, 45] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    transform="rotate(-90 25 50)"
                />
                <text x="25" y="53" textAnchor="middle" fill="white" fontSize="4.5" fontWeight="bold" style={{ fontFamily: 'monospace' }}>5234</text>
            </g>

            <g transform="translate(110, 50)">
                <path d="M35 0 V20 M35 70 V90" className="stroke-purple-200 dark:stroke-purple-900" strokeWidth="40" strokeLinecap="round" />
                <circle cx="35" cy="45" r="35" className="fill-white dark:fill-slate-800 stroke-slate-300" strokeWidth="2" />
                <circle cx="35" cy="45" r="30" className="fill-black" />

                <g clipPath="url(#watch-screen-clip)">
                    <clipPath id="watch-screen-clip"><circle cx="35" cy="45" r="30" /></clipPath>

                    <g transform="translate(15, 25)">
                        <motion.g animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} style={{ originX: 20, originY: 10 }}>
                            <path d="M20 5 C20 5 15 0 12 5 C9 0 4 0 4 5 C4 10 20 20 20 20 C20 20 36 10 36 5 C36 0 31 0 28 5 C25 0 20 5 20 5"
                                className="fill-red-500" transform="scale(0.5) translate(20, 0)" />
                        </motion.g>

                        {/* Smooth EKG Trace Animation */}
                        <path d="M0 25 H10 L15 15 L20 35 L25 10 L30 25 H40" className="stroke-green-900/40" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <motion.path
                            d="M0 25 H10 L15 15 L20 35 L25 10 L30 25 H40"
                            className="stroke-green-400" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: [0, 1, 1, 0], opacity: [1, 1, 0, 0] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        />

                        <motion.text x="20" y="45" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 1, repeat: Infinity }}>
                            78 BPM
                        </motion.text>
                    </g>
                </g>
            </g>
        </motion.g>
    </svg>
);

const ConsoleGraphic = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g
            transform="translate(35, 15) scale(0.85)"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        >
            <g transform="translate(125, 20)">
                <rect x="0" y="0" width="50" height="100" className="fill-slate-900 stroke-slate-700" strokeWidth="1.5" />
                <circle cx="10" cy="15" r="2" className="fill-slate-800" />
                <circle cx="25" cy="15" r="2" className="fill-slate-800" />
                <circle cx="40" cy="15" r="2" className="fill-slate-800" />
                <circle cx="10" cy="25" r="2" className="fill-slate-800" />
                <circle cx="25" cy="25" r="2" className="fill-slate-800" />
                <circle cx="40" cy="25" r="2" className="fill-slate-800" />
                <circle cx="25" cy="50" r="8" className="fill-slate-800 stroke-green-600" strokeWidth="1" />
                <path d="M21 46 L29 54 M29 46 L21 54" className="stroke-green-600" strokeWidth="2" />
                <motion.circle
                    cx="40" cy="90" r="4" className="stroke-green-500" strokeWidth="1.5" fill="none"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </g>

            <g transform="translate(60, 20)">
                <path d="M10 0 C0 10 0 100 10 115 H40 C50 100 50 10 40 0 H10 Z" className="fill-white dark:fill-slate-200 stroke-slate-300" strokeWidth="1.5" />
                <path d="M15 0 C5 10 5 100 15 115" className="stroke-blue-500/50" strokeWidth="1" fill="none" />
                <path d="M35 0 C45 10 45 100 35 115" className="stroke-blue-500/50" strokeWidth="1" fill="none" />
                <path d="M25 50 L30 50 L30 60 L20 60 L20 55 L25 55" className="fill-none stroke-slate-400" strokeWidth="1.5" />
                <motion.path
                    d="M15 5 C10 20 10 80 15 110"
                    className="stroke-blue-400" strokeWidth="2" strokeLinecap="round"
                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />
            </g>

            <g transform="translate(20, 95)">
                <rect x="0" y="0" width="80" height="40" rx="3" className="fill-slate-800 stroke-slate-600" />
                <rect x="10" y="2" width="60" height="36" className="fill-black" />
                <rect x="12" y="4" width="56" height="32" className="fill-blue-900/40" />
                <path d="M15 20 H30 M40 10 L50 20 L40 30" className="stroke-green-400/80" strokeWidth="2" />
                <circle cx="55" cy="15" r="3" className="fill-red-500/80" />
                <path d="M0 0 H10 V40 H0 C-2 40 -2 0 0 0" className="fill-blue-500" />
                <path d="M70 0 H80 C82 0 82 40 80 40 H70 V0" className="fill-red-500" />
                <circle cx="5" cy="12" r="2" className="fill-slate-900" />
                <circle cx="5" cy="20" r="2" className="fill-slate-900" />
                <circle cx="75" cy="15" r="2" className="fill-slate-900" />
                <circle cx="75" cy="25" r="2" className="fill-slate-900" />
            </g>
        </motion.g>
    </svg>
);

const TvGraphic = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
            <g transform="translate(20, 20)">
                <rect x="0" y="0" width="160" height="100" rx="2" className="fill-black stroke-slate-600" strokeWidth="2" />
                <rect x="5" y="5" width="150" height="90" className="fill-slate-900" />

                <g transform="translate(15, 15)">
                    <rect x="0" y="0" width="130" height="30" rx="2" className="fill-slate-800" />
                    <motion.rect x="5" y="5" width="35" height="20" rx="1" className="fill-red-500/30" animate={{ opacity: [0.3, 0.8, 0.3], y: [0, -2, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
                    <motion.rect x="45" y="5" width="35" height="20" rx="1" className="fill-blue-500/30" animate={{ opacity: [0.3, 0.8, 0.3], y: [0, -2, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} />
                    <motion.rect x="85" y="5" width="35" height="20" rx="1" className="fill-green-500/30" animate={{ opacity: [0.3, 0.8, 0.3], y: [0, -2, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 1 }} />

                    {/* Floating Interface Elements inside top screen */}
                    <motion.circle cx="22" cy="15" r="4" className="fill-white/60" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                    <motion.rect x="50" y="10" width="20" height="2" rx="1" className="fill-white/80" animate={{ width: [15, 25, 15] }} transition={{ duration: 2, repeat: Infinity }} />
                    <motion.rect x="50" y="15" width="12" height="2" rx="1" className="fill-white/60" animate={{ width: [10, 20, 10] }} transition={{ duration: 2, repeat: Infinity, delay: 0.2 }} />
                    {/* Animated Cover Flow / Video Feed */}
                    <g clipPath="url(#tv-feed-clip)">
                        <clipPath id="tv-feed-clip"><rect x="0" y="40" width="130" height="30" rx="2" /></clipPath>
                        <rect x="0" y="40" width="130" height="30" rx="2" className="fill-slate-800" />

                        <motion.g animate={{ x: [-80, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}>
                            <rect x="-70" y="45" width="20" height="20" rx="1" className="fill-pink-500/40" />
                            <rect x="-45" y="45" width="20" height="20" rx="1" className="fill-cyan-500/40" />
                            <rect x="-20" y="45" width="20" height="20" rx="1" className="fill-green-500/40" />
                            <rect x="5" y="45" width="20" height="20" rx="1" className="fill-purple-500/40" />
                            <rect x="30" y="45" width="20" height="20" rx="1" className="fill-yellow-500/40" />
                            <rect x="55" y="45" width="20" height="20" rx="1" className="fill-red-500/40" />
                            <rect x="80" y="45" width="20" height="20" rx="1" className="fill-blue-500/40" />
                            <rect x="105" y="45" width="20" height="20" rx="1" className="fill-emerald-500/40" />
                            <rect x="130" y="45" width="20" height="20" rx="1" className="fill-orange-500/40" />
                            <rect x="155" y="45" width="20" height="20" rx="1" className="fill-pink-500/40" />
                        </motion.g>
                    </g>
                </g>

                <motion.path
                    d="M5 95 L40 60 L70 80 L100 40 L155 95 H5" className="fill-white/10"
                    animate={{ opacity: [0.1, 0.25, 0.1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
            </g>
            <path d="M80 120 L120 120 L140 130 H60 L80 120" className="fill-slate-700" />
        </motion.g>
    </svg>
);

const RepairGraphic = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
            <g transform="translate(80, 50) rotate(-5)">
                <rect x="0" y="0" width="55" height="95" rx="4" className="fill-slate-200 dark:fill-slate-800 stroke-slate-400 dark:stroke-slate-600" strokeWidth="1.5" />
                <circle cx="27" cy="30" r="10" className="stroke-slate-400 dark:stroke-slate-600" strokeWidth="1" />
            </g>
            <g transform="translate(60, 30) rotate(-5)">
                <rect x="0" y="0" width="53" height="93" rx="3" className="fill-slate-900/10 dark:fill-black/50 stroke-green-500/50" strokeWidth="1" />
                <rect x="5" y="45" width="43" height="40" rx="2" className="fill-black stroke-slate-600" />
                <path d="M10 10 H40 V35 H10 Z" className="fill-green-600 dark:fill-green-900 stroke-green-500" />
            </g>

            <g transform="translate(40, 10) rotate(-5)">
                <rect x="0" y="0" width="55" height="95" rx="4" className="fill-blue-50/50 dark:fill-blue-900/20 stroke-blue-500" strokeWidth="1.5" />
                <motion.rect
                    x="0" y="0" width="55" height="2" className="fill-blue-500"
                    animate={{ y: [0, 95, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <path d="M0 0 L55 95" className="stroke-white/30" strokeWidth="40" />
            </g>

            {/* Screwdriver - Hardcoded Visibility with Absolute Coordinates in 140-195 range */}
            <motion.g
                animate={{ x: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
                {/* Drawn directly with visible coordinates. Top-Right handle, pointing Left-Down slightly */}
                <g transform="rotate(10 170 110)">
                    {/* Handle: 180 to 195 */}
                    <path d="M180 110 L180 120 L195 120 L195 110 Z" className="fill-orange-600 stroke-orange-700" />
                    {/* Shaft: 180 to 140 */}
                    <path d="M140 115 L145 118 L180 118 L180 112 L145 112 Z" className="fill-slate-300 stroke-slate-400" />
                    {/* Cap */}
                    <rect x="195" y="108" width="4" height="14" rx="1" className="fill-orange-500" />
                </g>
            </motion.g>
        </motion.g>
    </svg>
);

const LaptopGraphic = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
            <g transform="translate(30, 30)">
                <path d="M10 70 L130 70 L140 85 H0 Z" className="fill-slate-200 dark:fill-slate-800 stroke-slate-400" strokeWidth="2" />
                <rect x="25" y="10" width="90" height="60" rx="4" className="fill-slate-900 stroke-slate-500" strokeWidth="2" />
                <g clipPath="url(#laptop-clip)">
                    <clipPath id="laptop-clip"><rect x="28" y="13" width="84" height="54" rx="2" /></clipPath>
                    <rect x="28" y="13" width="84" height="54" rx="2" className="fill-blue-900/40" />

                    {/* Animated code / lines inside screen */}
                    <motion.rect x="32" y="18" width="40" height="4" rx="1" className="fill-emerald-400/50" animate={{ width: [10, 40, 10] }} transition={{ duration: 3, repeat: Infinity }} />
                    <motion.rect x="32" y="26" width="60" height="4" rx="1" className="fill-teal-400/50" animate={{ width: [20, 60, 20] }} transition={{ duration: 4, repeat: Infinity, delay: 0.5 }} />
                    <motion.rect x="32" y="34" width="50" height="4" rx="1" className="fill-blue-400/50" animate={{ width: [15, 50, 15] }} transition={{ duration: 3.5, repeat: Infinity, delay: 1 }} />
                    <motion.rect x="32" y="42" width="70" height="4" rx="1" className="fill-indigo-400/50" animate={{ width: [30, 70, 30] }} transition={{ duration: 5, repeat: Infinity, delay: 1.5 }} />

                    {/* Scanning Line overlay */}
                    <motion.line x1="28" y1="13" x2="112" y2="13" className="stroke-white/10" strokeWidth="20" animate={{ y: [0, 54, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                </g>
                <rect x="50" y="75" width="40" height="5" rx="2" className="fill-slate-400 dark:fill-slate-600" />
            </g>
        </motion.g>
    </svg>
);

const DesktopGraphic = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g animate={{ y: [0, -3, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
            <g transform="translate(30, 20)">
                <rect x="10" y="10" width="100" height="70" rx="4" className="fill-slate-900 stroke-slate-600" strokeWidth="2" />
                <g clipPath="url(#desktop-clip)">
                    <clipPath id="desktop-clip"><rect x="14" y="14" width="92" height="62" rx="2" /></clipPath>
                    <rect x="14" y="14" width="92" height="62" rx="2" className="fill-black" />

                    {/* Futuristic Data Nodes */}
                    <motion.circle cx="30" cy="45" r="15" className="stroke-blue-500/30" strokeWidth="2" fill="none" animate={{ scale: [0.8, 1.2, 0.8], rotate: [0, 180, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
                    <motion.circle cx="30" cy="45" r="8" className="fill-blue-500/60" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />

                    <motion.circle cx="75" cy="35" r="20" className="stroke-teal-500/30" strokeWidth="2" strokeDasharray="5 5" fill="none" animate={{ rotate: [-360, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} />
                    <motion.circle cx="75" cy="35" r="10" className="fill-teal-500/60" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }} />

                    <line x1="30" y1="45" x2="75" y2="35" className="stroke-green-400/30" strokeWidth="2" />

                    {/* Animated packets traveling across the line */}
                    <motion.circle r="2" className="fill-green-400" animate={{ cx: [30, 75], cy: [45, 35], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
                    <motion.circle r="2" className="fill-emerald-300" animate={{ cx: [75, 30], cy: [35, 45], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.75 }} />
                </g>
                <path d="M50 80 V100" className="stroke-slate-500" strokeWidth="8" />
                <path d="M30 100 H90" className="stroke-slate-500" strokeWidth="6" strokeLinecap="round" />
                <rect x="120" y="20" width="30" height="80" rx="3" className="fill-slate-800 stroke-slate-600" strokeWidth="2" />
                <circle cx="135" cy="35" r="5" className="fill-blue-500/80" />
            </g>
        </motion.g>
    </svg>
);

const CameraGraphic = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            <g transform="translate(45, 40)">
                <rect x="0" y="10" width="110" height="70" rx="8" className="fill-slate-800 stroke-slate-600" strokeWidth="2" />
                <rect x="20" y="0" width="30" height="10" rx="2" className="fill-slate-700 stroke-slate-500" strokeWidth="2" />
                <circle cx="55" cy="45" r="25" className="fill-slate-900 stroke-slate-500" strokeWidth="4" />
                <circle cx="55" cy="45" r="15" className="fill-black" />
                <circle cx="50" cy="40" r="4" className="fill-white/30" />
                <circle cx="15" cy="25" r="4" className="fill-red-500" />
            </g>
        </motion.g>
    </svg>
);

const EarbudsGraphic = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g animate={{ y: [0, -4, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
            <g transform="translate(60, 40)">
                {/* Case */}
                <rect x="15" y="30" width="50" height="40" rx="15" className="fill-white dark:fill-slate-200 stroke-slate-300" strokeWidth="2" />
                <path d="M15 45 Q40 55 65 45" className="stroke-slate-200" strokeWidth="1.5" fill="none" />
                <circle cx="40" cy="55" r="2.5" className="fill-green-500" />

                {/* Left Earbud */}
                <g transform="translate(22, 12)">
                    <rect x="0" y="5" width="6" height="15" rx="3" className="fill-white dark:fill-slate-100 stroke-slate-300" strokeWidth="1.5" />
                    <circle cx="3" cy="5" r="6" className="fill-white dark:fill-slate-100 stroke-slate-300" strokeWidth="1.5" />
                    <circle cx="5" cy="5" r="2" className="fill-slate-900" />
                </g>

                {/* Right Earbud */}
                <g transform="translate(42, 12)">
                    <rect x="6" y="5" width="6" height="15" rx="3" className="fill-white dark:fill-slate-100 stroke-slate-300" strokeWidth="1.5" />
                    <circle cx="9" cy="5" r="6" className="fill-white dark:fill-slate-100 stroke-slate-300" strokeWidth="1.5" />
                    <circle cx="7" cy="5" r="2" className="fill-slate-900" />
                </g>
            </g>
        </motion.g>
    </svg>
);

const ScreenGuardGraphic = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            {/* Base Phone */}
            <g transform="translate(70, 30)">
                <rect x="0" y="0" width="60" height="110" rx="10" className="fill-slate-800 stroke-slate-600" strokeWidth="2" />
                <rect x="4" y="4" width="52" height="102" rx="6" className="fill-black" />
            </g>
            {/* Screen Guard Hovering Above */}
            <motion.g
                transform="translate(75, 15)"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
                <rect x="0" y="0" width="50" height="100" rx="4" className="fill-cyan-500/30 stroke-cyan-400" strokeWidth="2" />
                <path d="M0 0 L50 100" className="stroke-white/40" strokeWidth="20" />
            </motion.g>
            {/* Sparkles indicating Unbreakable / Toughness */}
            <motion.circle cx="140" cy="40" r="3" className="fill-cyan-300" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
            <motion.circle cx="60" cy="110" r="2" className="fill-cyan-300" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 1 }} />
        </motion.g>
    </svg>
);

// --- Data ---
const categories = [
    {
        id: 'smartphone',
        name: 'Smartphones',
        subtext: 'Instant cash for your phone',
        component: <SmartphoneGraphic />,
        bgColors: 'bg-blue-50 dark:bg-white/[0.03] dark:backdrop-blur-xl dark:border-white/10 dark:border dark:hover:bg-white/[0.06] dark:hover:shadow-[0_0_30px_rgba(19,226,91,0.2)]',
        textColor: 'text-blue-900 dark:text-blue-100'
    },
    {
        id: 'tablet',
        name: 'Tablets',
        subtext: 'Get up to ₹40,000',
        component: <TabletGraphic />,
        bgColors: 'bg-purple-50 dark:bg-white/[0.03] dark:backdrop-blur-xl dark:border-white/10 dark:border dark:hover:bg-white/[0.06] dark:hover:shadow-[0_0_30px_rgba(19,226,91,0.2)]',
        textColor: 'text-purple-900 dark:text-purple-100'
    },
    {
        id: 'camera',
        name: 'Cameras',
        subtext: 'Premium value for your gear',
        component: <CameraGraphic />,
        bgColors: 'bg-rose-50 dark:bg-white/[0.03] dark:backdrop-blur-xl dark:border-white/10 dark:border dark:hover:bg-white/[0.06] dark:hover:shadow-[0_0_30px_rgba(19,226,91,0.2)]',
        textColor: 'text-rose-900 dark:text-rose-100'
    },
    {
        id: 'laptop',
        name: 'Laptops',
        subtext: 'Upgrade today, highest payouts',
        component: <LaptopGraphic />,
        bgColors: 'bg-cyan-50 dark:bg-white/[0.03] dark:backdrop-blur-xl dark:border-white/10 dark:border dark:hover:bg-white/[0.06] dark:hover:shadow-[0_0_30px_rgba(19,226,91,0.2)]',
        textColor: 'text-cyan-900 dark:text-cyan-100'
    },
    {
        id: 'watch',
        name: 'Smartwatches',
        subtext: 'Top market prices guaranteed',
        component: <WatchGraphic />,
        bgColors: 'bg-orange-50 dark:bg-white/[0.03] dark:backdrop-blur-xl dark:border-white/10 dark:border dark:hover:bg-white/[0.06] dark:hover:shadow-[0_0_30px_rgba(19,226,91,0.2)]',
        textColor: 'text-orange-900 dark:text-orange-100'
    },
    {
        id: 'smarttv',
        name: 'Smart TVs',
        subtext: 'Best value for your television',
        component: <TvGraphic />,
        bgColors: 'bg-emerald-50 dark:bg-white/[0.03] dark:backdrop-blur-xl dark:border-white/10 dark:border dark:hover:bg-white/[0.06] dark:hover:shadow-[0_0_30px_rgba(19,226,91,0.2)]',
        textColor: 'text-emerald-900 dark:text-emerald-100'
    },
    {
        id: 'console',
        name: 'Consoles',
        subtext: 'Get up to ₹24,000',
        component: <ConsoleGraphic />,
        bgColors: 'bg-indigo-50 dark:bg-white/[0.03] dark:backdrop-blur-xl dark:border-white/10 dark:border dark:hover:bg-white/[0.06] dark:hover:shadow-[0_0_30px_rgba(19,226,91,0.2)]',
        textColor: 'text-indigo-900 dark:text-indigo-100'
    },
    {
        id: 'desktop',
        name: 'Desktops',
        subtext: 'Turn your old PC into cash',
        component: <DesktopGraphic />,
        bgColors: 'bg-teal-50 dark:bg-white/[0.03] dark:backdrop-blur-xl dark:border-white/10 dark:border dark:hover:bg-white/[0.06] dark:hover:shadow-[0_0_30px_rgba(19,226,91,0.2)]',
        textColor: 'text-teal-900 dark:text-teal-100'
    },
    {
        id: 'earbuds',
        name: 'Earbuds',
        subtext: 'Instant quote and fast money',
        component: <EarbudsGraphic />,
        bgColors: 'bg-fuchsia-50 dark:bg-white/[0.03] dark:backdrop-blur-xl dark:border-white/10 dark:border dark:hover:bg-white/[0.06] dark:hover:shadow-[0_0_30px_rgba(19,226,91,0.2)]',
        textColor: 'text-fuchsia-900 dark:text-fuchsia-100'
    },
    {
        id: 'repair',
        name: 'Repair',
        subtext: 'Quick, reliable, affordable',
        component: <RepairGraphic />,
        bgColors: 'bg-red-50 dark:bg-white/[0.03] dark:backdrop-blur-xl dark:border-white/10 dark:border dark:hover:bg-white/[0.06] dark:hover:shadow-[0_0_30px_rgba(19,226,91,0.2)]',
        textColor: 'text-red-900 dark:text-red-100'
    },
    {
        id: 'unbreakable-screenguard',
        name: 'Screen Guard',
        subtext: 'Unbreakable • 3-Hr Doorstep',
        component: <ScreenGuardGraphic />,
        bgColors: 'bg-cyan-50 dark:bg-white/[0.03] dark:backdrop-blur-xl dark:border-white/10 dark:border dark:hover:bg-white/[0.06] dark:hover:shadow-[0_0_30px_rgba(19,226,91,0.2)]',
        textColor: 'text-cyan-900 dark:text-cyan-100'
    },
];


export default function CategorySelector({ onSelect }: CategorySelectorProps) {
    return (
        <div className="space-y-8">
            <div className="text-center space-y-2 mb-12">
                <h2 className="text-3xl md:text-5xl font-bold dark:text-white tracking-tight">What would you like to sell?</h2>
                <p className="text-muted-foreground dark:text-slate-400 text-lg">Select a category to proceed</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 container px-4 mx-auto">
                {categories.map((cat, index) => (
                    <motion.button
                        key={cat.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        viewport={{ once: true }}
                        onClick={() => onSelect(cat.id)}
                        className={`
                            relative h-60 md:h-72 w-full rounded-[2rem] overflow-hidden text-left
                            border transition-all duration-300 group
                            ${cat.bgColors} hover:shadow-xl hover:-translate-y-1
                            border-transparent hover:border-black/5 dark:hover:border-white/10
                        `}
                    >
                        {/* Text Content */}
                        <div className="absolute top-6 left-6 md:top-8 md:left-8 z-20 w-3/4">
                            <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-70 mb-2 ${cat.textColor}`}>
                                {cat.subtext}
                            </p>
                            <h3 className={`text-3xl md:text-4xl font-bold tracking-tight ${cat.textColor} leading-none`}>
                                {cat.name}
                            </h3>
                        </div>

                        {/* Graphic */}
                        <div className="absolute bottom-4 right-4 md:bottom-2 md:right-2 w-40 h-32 md:w-64 md:h-48 transform group-hover:scale-110 transition-transform duration-500 ease-out origin-bottom-right z-10">
                            {cat.component}
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
