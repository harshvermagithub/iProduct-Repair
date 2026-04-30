'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const REVIEWS = [
    {
        name: "Rahul Sharma",
        role: "Software Engineer",
        text: "Sold my iPhone 13. The price was exactly what was quoted on the site. No hidden deductions. Executive was polite.",
        initial: "R"
    },
    {
        name: "Priya Patel",
        role: "Student",
        text: "Honestly simpler than I thought. I needed cash urgently for my new phone, and they paid via UPI instantly at my doorstep.",
        initial: "P"
    },
    {
        name: "Amit Kumar",
        role: "Business Owner",
        text: "Getting a quote was super fast. The pickup agent arrived on time and the payment was instant. Great service!",
        initial: "A"
    },
    {
        name: "Sneha Gupta",
        role: "Graphic Designer",
        text: "I was skeptical at first, but the process was smooth. The best part is the doorstep pickup. No hassle of going to a shop.",
        initial: "S"
    },
    {
        name: "Vikram Singh",
        role: "Marketing Manager",
        text: "Got a much better price here compared to other exchange offers. The cash payment option is a life saver.",
        initial: "V"
    },
    {
        name: "Anjali Desai",
        role: "Content Creator",
        text: "Seamless experience! Checked the price, scheduled pickup, and got paid in cash within 24 hours. Highly recommend.",
        initial: "A"
    },
    {
        name: "Rohit Verma",
        role: "Architect",
        text: "Very professional team. They checked the device quickly and transferred the money immediately. Trustworthy service.",
        initial: "R"
    },
    {
        name: "Kavita Reddy",
        role: "Doctor",
        text: "Sold my old Samsung phone. The valuation was fair and higher than what I expected. Will use again.",
        initial: "K"
    },
    {
        name: "Arjun Nair",
        role: "Freelancer",
        text: "Appreciated the transparency. The agent explained every check he did. Payment was done right in front of me.",
        initial: "A"
    },
    {
        name: "Meera Joshi",
        role: "Teacher",
        text: "Quick and easy way to sell old gadgets. The website is user-friendly and the support team is very helpful.",
        initial: "M"
    },
    {
        name: "Siddharth Malhotra",
        role: "Entrepreneur",
        text: "Efficient service. No haggling over price at the last minute. What you see is what you get if condition matches.",
        initial: "S"
    },
    {
        name: "Neha Kapoor",
        role: "HR Professional",
        text: "Safe and secure transaction. I was worried about data safety, but they ensured everything was wiped clean.",
        initial: "N"
    },
    {
        name: "Rajesh Iyer",
        role: "Consultant",
        text: "Fantanstic experience. Pickup was scheduled at my convenience. The whole process took less than 15 minutes.",
        initial: "R"
    },
    {
        name: "Pooja Mehta",
        role: "Banker",
        text: "Good value for money. Instead of letting my old phone rot in a drawer, I got good cash for it instantly.",
        initial: "P"
    }
];

export const ReviewsMarquee = () => {
    return (
        <div className="relative w-full overflow-hidden py-4">
            {/* Gradient Masks for smooth fade out at edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

            <div className="flex w-max">
                {/* First Copy */}
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: "-100%" }}
                    transition={{
                        duration: 50, // Adjust speed here (higher = slower)
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
                        duration: 50,
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
    <div className="relative w-[260px] md:w-[280px] flex-shrink-0 p-6 rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        style={{
            background: 'linear-gradient(135deg, #10B981, #065f46)'
        }}
    >
        {/* Dot Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:10px_10px]" />

        <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(v => <Star key={v} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
            </div>
            <p className="text-sm leading-relaxed text-white/90 line-clamp-4 font-medium">
                &quot;{review.text}&quot;
            </p>
            <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-sm border border-white/10 shadow-inner">
                    {review.initial}
                </div>
                <div>
                    <h4 className="font-bold text-sm text-white">{review.name}</h4>
                    <p className="text-xs text-white/60 font-medium tracking-wide">{review.role}</p>
                </div>
            </div>
        </div>
    </div>
);
