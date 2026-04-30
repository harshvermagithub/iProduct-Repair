'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SVGLoader from './SVGLoader';

export default function InitialLoader() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Reduced splash screen duration from 2.2s to 1.2s for a snappier experience
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1200);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }} // Slightly faster exit transition too
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
                >
                    <SVGLoader />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
