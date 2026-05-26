'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const REVIEWS = [
    {
        name: "Rahul Sharma",
        role: "Software Engineer • Marathahalli",
        text: "Got my iPhone 13 screen replaced at my office desk in 30 minutes! The technician was professional, and the doorstep diagnostic service was extremely convenient.",
        initial: "R"
    },
    {
        name: "Priya Patel",
        role: "UX/UI Designer • HSR Layout",
        text: "Bought a certified refurbished MacBook Air M1 in pristine condition. It came with 100% battery health and a 12-month warranty! Highly cheap cost compared to retail.",
        initial: "P"
    },
    {
        name: "Amit Kumar",
        role: "Business Owner • Indiranagar",
        text: "Excellent doorstep iPad technical care. Very quick booking and the price was exactly what was quoted. Highly recommend iProduct Repair.",
        initial: "A"
    },
    {
        name: "Sneha Gupta",
        role: "Graphic Designer • Whitefield",
        text: "I was skeptical about pre-owned gadgets, but my refurbished iPhone 15 Pro Max arrived in flawless condition. Step-by-step diagnostic certificate was provided.",
        initial: "S"
    },
    {
        name: "Vikram Singh",
        role: "Tech Lead • Koramangala",
        text: "Doorstep MacBook Pro battery replacement completed right in front of my eyes. No risk of data theft or generic parts. Professional and economical technical team.",
        initial: "V"
    },
    {
        name: "Anjali Desai",
        role: "Content Creator • Jayanagar",
        text: "Stunning experience! The engineer applied the unbreakable screen guard at my place in 2 hours. Extremely cheap rates and absolute premium quality.",
        initial: "A"
    },
    {
        name: "Rohit Verma",
        role: "Architect • Bellandur",
        text: "Professional, fast, and fully transparent. They verified my Apple Watch screen issue and replaced the digitizer on-site. Truly Bangalore's best.",
        initial: "R"
    }
];

export const ReviewsMarquee = () => {
    return (
        <div className="relative w-full overflow-hidden py-4">
            {/* Gradient Masks for smooth fade out at edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent pointer-events-none" />

            <div className="flex w-max">
                {/* First Copy */}
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: "-100%" }}
                    transition={{
                        duration: 40, // Adjust speed here (higher = slower)
                        ease: "linear",
                        repeat: Infinity,
                    }}
                    className="flex gap-6 pr-6"
                >
                    {REVIEWS.map((review, i) => (
                        <ReviewCard key={`review-1-${i}`} review={review} />
                    ))}
                </motion.div>

                {/* Second Copy for Loop */}
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: "-100%" }}
                    transition={{
                        duration: 40,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                    className="flex gap-6 pr-6"
                >
                    {REVIEWS.map((review, i) => (
                        <ReviewCard key={`review-2-${i}`} review={review} />
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

const ReviewCard = ({ review }: { review: typeof REVIEWS[0] }) => (
    <div className="relative w-[280px] md:w-[320px] flex-shrink-0 p-6 rounded-[2.5rem] shadow-md dark:shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden group hover:border-blue-500/40 transition-all duration-300 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md"
    >
        {/* Premium ambient tech radial glow behind card on hover */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent blur-2xl rounded-full opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
        
        {/* Subtle grid pattern overlay for high-fidelity technical texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_center,_white_1.5px,_transparent_1.5px)] bg-[length:12px_12px]" />

        <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(v => (
                    <Star key={v} className="w-4 h-4 fill-yellow-400 text-yellow-400 group-hover:scale-110 transition-transform duration-300" style={{ transitionDelay: `${v * 50}ms` }} />
                ))}
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-4 font-medium italic select-none">
                &quot;{review.text}&quot;
            </p>
            <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-extrabold text-sm border border-blue-500/25 shadow-lg group-hover:bg-blue-500/20 group-hover:border-blue-500/40 transition-all duration-300">
                    {review.initial}
                </div>
                <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">{review.name}</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{review.role}</p>
                </div>
            </div>
        </div>
    </div>
);
