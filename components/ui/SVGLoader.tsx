'use client';

import { motion } from "framer-motion";
import { CanvasLogo } from "@/components/CanvasGraphics";

export default function SVGLoader({ className = "" }: { className?: string }) {
    return (
        <div className={`w-full h-full flex flex-col items-center justify-center bg-black backdrop-blur-md ${className}`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6"
            >
                {/* Minimalist Apple-like glowing loader circle */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-white/5 border-t-blue-500 shadow-[0_0_15px_rgba(41,151,255,0.4)]"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    />
                    {/* Small pulsing heart dot in center */}
                    <motion.div 
                        className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(41,151,255,0.8)]"
                        animate={{ scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>

                <div className="flex flex-col items-center gap-2">
                    <CanvasLogo className="scale-125 select-none pointer-events-none" />

                    <div className="flex gap-1.5 mt-2 justify-center">
                        <motion.div
                            className="w-1.5 h-1.5 rounded-full bg-blue-500/80"
                            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                            className="w-1.5 h-1.5 rounded-full bg-blue-500/80"
                            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: 0.15 }}
                        />
                        <motion.div
                            className="w-1.5 h-1.5 rounded-full bg-blue-500/80"
                            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }}
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
