'use client';

import { motion } from 'framer-motion';

interface CategorySelectorProps {
    onSelect: (category: string) => void;
}

// --- Animated SVG Components ---
// Obsolete non-Apple category graphics pruned for cleaner specialized Apple-only technical codebase.


const RepairGraphic = () => (
    <svg viewBox="0 0 200 150" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
            {/* Holographic grid board background */}
            <circle cx="100" cy="75" r="45" className="fill-blue-500/5 stroke-blue-500/10" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="100" cy="75" r="30" className="fill-blue-500/5 stroke-blue-500/20" strokeWidth="1" />

            {/* Premium Space-Black Device Blueprint */}
            <g transform="translate(70, 30)">
                <rect x="0" y="0" width="60" height="90" rx="8" className="fill-slate-950 stroke-blue-500/40" strokeWidth="2" />
                <rect x="4" y="10" width="52" height="70" rx="2" className="fill-slate-900/50" />
                
                {/* Tech chip nodes */}
                <rect x="22" y="25" width="16" height="16" rx="2" className="fill-blue-500/20 stroke-blue-500" strokeWidth="1.5" />
                <line x1="16" y1="33" x2="22" y2="33" className="stroke-blue-400" strokeWidth="1.5" />
                <line x1="38" y1="33" x2="44" y2="33" className="stroke-blue-400" strokeWidth="1.5" />
                <line x1="30" y1="19" x2="30" y2="25" className="stroke-blue-400" strokeWidth="1.5" />
                <line x1="30" y1="41" x2="30" y2="47" className="stroke-blue-400" strokeWidth="1.5" />
            </g>

            {/* Glowing Laser Diagnostic Scanner */}
            <motion.g
                animate={{ y: [20, 110, 20] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            >
                <line x1="55" y1="10" x2="145" y2="10" className="stroke-blue-500" strokeWidth="2.5" style={{ filter: 'drop-shadow(0px 0px 8px #2997ff)' }} />
                <polygon points="100,10 95,20 105,20" className="fill-blue-400/30" />
            </motion.g>

            {/* Technical Tool Graphic - Silver/Blue metallic screwdriver */}
            <motion.g
                animate={{ x: [0, -3, 0], y: [0, 3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <g transform="translate(130, 20) rotate(15)">
                    {/* Metal Shaft */}
                    <rect x="0" y="38" width="5" height="35" rx="1.5" className="fill-slate-300 stroke-slate-400" strokeWidth="1" />
                    {/* Glowing tip */}
                    <circle cx="2.5" cy="73" r="3.5" className="fill-blue-400" style={{ filter: 'drop-shadow(0px 0px 5px #2997ff)' }} />
                    {/* Space-gray Handle */}
                    <rect x="-4" y="0" width="13" height="38" rx="4" className="fill-slate-900 stroke-blue-500/30" strokeWidth="1.5" />
                    <line x1="2.5" y1="6" x2="2.5" y2="32" className="stroke-blue-500/50" strokeWidth="1.5" />
                </g>
            </motion.g>
        </motion.g>
    </svg>
);



// --- Data ---
const categories = [
    {
        id: 'repair',
        name: 'Technical Repair',
        subtext: 'Certified Onsite Engineers',
        component: <RepairGraphic />,
        bgColors: 'bg-white/50 dark:bg-slate-950/45 backdrop-blur-[20px] border border-white/40 dark:border-white/10 hover:border-blue-500/30 dark:hover:border-blue-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]',
        textColor: 'text-slate-900 dark:text-slate-100'
    },
];


export default function CategorySelector({ onSelect }: CategorySelectorProps) {
    return (
        <div className="space-y-8">
            <div className="text-center space-y-2 mb-12">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">Diagnostics & Onsite Technical Support</h2>
                <p className="text-muted-foreground text-lg">Select a category to calculate diagnostic rates and book doorstep technical service</p>
            </div>

            {/* Premium Liquid Glass Card with Floating Blobs */}
            <div className="relative flex justify-center max-w-2xl mx-auto px-4 group">
                {/* Floating Blobs behind card */}
                <div className="absolute inset-0 -z-10 overflow-visible pointer-events-none">
                    <div className="absolute top-[-30px] left-[-30px] w-48 h-48 bg-gradient-to-tr from-blue-400/30 to-indigo-500/30 rounded-full blur-2xl opacity-60 dark:opacity-30 animate-[pulse_6s_infinite_alternate]" />
                    <div className="absolute bottom-[-20px] right-[-20px] w-56 h-56 bg-gradient-to-tr from-purple-400/25 to-pink-500/25 rounded-full blur-3xl opacity-50 dark:opacity-20 animate-[pulse_8s_infinite_alternate_2s]" />
                </div>

                {categories.map((cat, index) => (
                    <motion.button
                        key={cat.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        viewport={{ once: true }}
                        onClick={() => onSelect(cat.id)}
                        className={`
                            relative h-60 md:h-72 w-full rounded-[2.5rem] overflow-hidden text-left
                            border transition-all duration-300 group-hover:scale-[1.01]
                            ${cat.bgColors} hover:shadow-xl hover:-translate-y-1
                            border-transparent hover:border-black/5 dark:hover:border-white/10
                        `}
                    >
                        {/* Glass Reflection Highlight line */}
                        <div className="absolute inset-x-12 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/20 to-transparent animate-[pulse_3s_infinite_alternate]" />

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
