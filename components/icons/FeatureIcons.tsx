'use client';

import { motion } from 'framer-motion';

export const PriceGraphic = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={`${className || 'w-full h-full'} drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            {/* Outer rotating ring */}
            <motion.circle cx="50" cy="50" r="35" className="stroke-green-500/30 group-hover:stroke-slate-950/20" strokeWidth="2" strokeDasharray="10 10" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} style={{ originX: 0.5, originY: 0.5 }} />
            <motion.circle cx="50" cy="50" r="45" className="stroke-green-400/20 group-hover:stroke-slate-950/10" strokeWidth="1" strokeDasharray="5 15" animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} style={{ originX: 0.5, originY: 0.5 }} />

            {/* Main Coin / Badge */}
            <motion.circle cx="50" cy="50" r="28" className="fill-slate-900 dark:fill-black stroke-green-500 group-hover:stroke-slate-950 group-hover:fill-white/20" strokeWidth="3" />
            <motion.circle cx="50" cy="50" r="20" className="fill-green-900/50 group-hover:fill-slate-950/20" />

            {/* Rupee Symbol */}
            <path d="M42 38H58M42 46H52 M46 46C56 46 56 36 52 36 M46 46L58 62" className="stroke-green-400 group-hover:stroke-slate-950" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

            {/* Floating particles */}
            <motion.circle cx="20" cy="30" r="2" className="fill-green-300 group-hover:fill-slate-950" animate={{ opacity: [0, 1, 0], y: [0, -10] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
            <motion.circle cx="80" cy="70" r="2.5" className="fill-green-400 group-hover:fill-slate-950" animate={{ opacity: [0, 1, 0], y: [0, -15] }} transition={{ duration: 2.5, repeat: Infinity, delay: 1 }} />
            <motion.circle cx="75" cy="25" r="1.5" className="fill-emerald-300 group-hover:fill-slate-950" animate={{ opacity: [0, 1, 0], y: [0, -10] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} />
        </motion.g>
    </svg>
);

export const SpeedGraphic = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={`${className || 'w-full h-full'} drop-shadow-[0_0_15px_rgba(20,184,166,0.4)]`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g animate={{ y: [0, -5, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
            {/* Fast lines background */}
            <motion.path d="M20 50L35 50M15 65L40 65M25 35L45 35" className="stroke-teal-500/30 group-hover:stroke-slate-950/20" strokeWidth="3" strokeLinecap="round" animate={{ x: [-20, 10, -20], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />

            {/* Primary Shape */}
            <motion.polygon points="60,20 35,55 50,55 45,85 75,45 55,45" className="fill-slate-900 dark:fill-black stroke-teal-500 group-hover:stroke-slate-950 group-hover:fill-white/20" strokeWidth="3" strokeLinejoin="round" />
            <motion.polygon points="57,25 38,52 48,52 44,78 68,48 52,48" className="fill-teal-500/20 group-hover:fill-slate-950/10" />

            <motion.circle cx="65" cy="30" r="1.5" className="fill-teal-300 group-hover:fill-slate-950" animate={{ opacity: [0, 1, 0], scale: [1, 2, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
            <motion.circle cx="45" cy="20" r="2" className="fill-teal-400 group-hover:fill-slate-950" animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 1] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} />
            <motion.circle cx="40" cy="80" r="1.5" className="fill-cyan-300 group-hover:fill-slate-950" animate={{ opacity: [0, 1, 0], scale: [1, 2, 1] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.8 }} />
        </motion.g>
    </svg>
);

export const SecurityGraphic = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={`${className || 'w-full h-full'} drop-shadow-[0_0_15px_rgba(132,204,22,0.4)]`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g animate={{ y: [0, -4, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}>
            {/* Orbiting data rings */}
            <motion.ellipse cx="50" cy="50" rx="40" ry="20" className="stroke-lime-500/20 group-hover:stroke-slate-950/10" strokeWidth="1.5" strokeDasharray="6 6" animate={{ rotateZ: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} style={{ originX: 0.5, originY: 0.5 }} />
            <motion.ellipse cx="50" cy="50" rx="20" ry="40" className="stroke-lime-500/20 group-hover:stroke-slate-950/10" strokeWidth="1.5" strokeDasharray="6 6" animate={{ rotateZ: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} style={{ originX: 0.5, originY: 0.5 }} />

            {/* Shield Body */}
            <motion.path d="M50 20 L25 30 V50 C25 70 50 85 50 85 C50 85 75 70 75 50 V30 L50 20 Z" className="fill-slate-900 dark:fill-black stroke-lime-500 group-hover:stroke-slate-950 group-hover:fill-white/20" strokeWidth="3" strokeLinejoin="round" />
            <path d="M50 25 L30 33 V50 C30 66 50 78 50 78 C50 78 70 66 70 50 V33 L50 25 Z" className="fill-lime-500/10 group-hover:fill-slate-950/10" />

            {/* Checkmark */}
            <motion.path d="M40 52 L48 60 L62 42" className="stroke-lime-400 group-hover:stroke-slate-950" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 1.5, delay: 0.5 }}
            />

            <motion.circle cx="50" cy="50" r="45" className="stroke-lime-400/20 group-hover:stroke-slate-950/10" strokeWidth="1" animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 4, repeat: Infinity }} />
            <motion.circle cx="20" cy="80" r="2" className="fill-lime-300 group-hover:fill-slate-950" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
            <motion.circle cx="80" cy="20" r="2" className="fill-lime-400 group-hover:fill-slate-950" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
        </motion.g>
    </svg>
);
