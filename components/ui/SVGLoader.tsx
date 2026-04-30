'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import { HeroLogo } from "@/components/HeroLogo";

const SmartphoneLoaderSVG = () => (
    <div className="relative w-12 h-20 md:w-16 md:h-24">
        <svg width="100%" height="100%" viewBox="0 0 32 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl relative z-20">
            {/* Phone Body */}
            <rect
                x="1"
                y="1"
                width="30"
                height="58"
                rx="4"
                strokeWidth="1.5"
                className="fill-slate-100 stroke-slate-800"
            />
            {/* Screen cutout (White background per user request: "no background") */}
            <rect x="2.5" y="2.5" width="27" height="55" rx="2.5" className="fill-white" />

            {/* Notch */}
            <rect x="10" y="3" width="12" height="3" rx="1.5" className="fill-slate-800" />
        </svg>

        {/* F Logo on Screen (Black F on white screen) */}
        <div className="absolute top-[8%] left-[12%] w-[76%] h-[85%] z-20 flex items-center justify-center opacity-90">
            <Image
                src="/logo_final_v3.png"
                alt="F"
                fill
                className="object-contain p-1"
                priority
            />
        </div>

        {/* Animated Scan Line (Slate/Gray for contrast on White text) */}
        <motion.div
            className="absolute left-[15%] right-[15%] h-0.5 bg-slate-400 shadow-[0_0_8px_2px_rgba(148,163,184,0.3)] z-30"
            animate={{ top: ['10%', '85%', '10%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />

        {/* Screen Content Pulse (Light Gray tint) */}
        <motion.div
            className="absolute inset-x-[15%] top-[10%] bottom-[15%] bg-slate-200/50 rounded-sm z-20"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
        />
    </div>
);

export default function SVGLoader({ className = "" }: { className?: string }) {
    return (
        <div className={`w-full h-full flex flex-col items-center justify-center bg-white/95 backdrop-blur-md ${className}`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6"
            >
                <SmartphoneLoaderSVG />

                <div className="flex flex-col items-center gap-1">
                    {/* forceLight prop applied to ensure FONZKART text is pure black always */}
                    <HeroLogo className="scale-125" forceLight />

                    <div className="flex gap-1">
                        <motion.div
                            className="w-2 h-2 rounded-full bg-green-500"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                            className="w-2 h-2 rounded-full bg-green-500"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                            className="w-2 h-2 rounded-full bg-green-500"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
