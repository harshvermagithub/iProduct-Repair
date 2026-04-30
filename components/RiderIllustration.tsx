
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function RiderIllustration() {
    return (
        <motion.div
            className="relative w-full h-full"
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
            <Image
                src="/rider.svg"
                alt="Fonzkart Rider"
                fill
                className="object-contain drop-shadow-xl p-2"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
            />
        </motion.div>
    );
}
