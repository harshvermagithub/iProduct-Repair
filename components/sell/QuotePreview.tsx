
// import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";

interface QuotePreviewProps {
    basePrice: number;
    deviceDetails: string;
    onGetExactValue: () => void;
    onBack: () => void;
    isRepair?: boolean;
}

export default function QuotePreview({ basePrice, deviceDetails, onGetExactValue, onBack, isRepair }: QuotePreviewProps) {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <button onClick={onBack} className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back</span>
                </button>
            </div>

            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">{isRepair ? 'Estimated Repair Cost' : 'Your Device Value'}</h2>
                <p className="text-muted-foreground">{deviceDetails}</p>
            </div>
            <div className="text-center space-y-4">
                <div className="text-5xl font-extrabold text-primary">
                    ₹{basePrice.toLocaleString()}
                    <span className="text-lg text-muted-foreground font-normal ml-2">max value</span>
                </div>
            </div>

            <div className="bg-accent/30 p-6 rounded-2xl space-y-4">
                <h3 className="font-semibold text-lg">Why answer a few questions?</h3>
                <ul className="space-y-3">
                    {[
                        "Get the exact value for your device condition",
                        "Avoid re-negotiation at doorstep",
                        "Faster payment processing"
                    ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3">
                            <div className="bg-green-100 p-1 rounded-full"><Check className="w-4 h-4 text-green-600" /></div>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <button
                onClick={onGetExactValue}
                className="w-full py-4 text-xl font-bold text-white bg-primary rounded-xl shadow-lg hover:bg-primary/90 hover:scale-[1.02] transition-all"
            >
                Get Exact Value
            </button>
        </div>
    );
}
