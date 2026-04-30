import { Check } from 'lucide-react';

export default function OrderStepper({ status }: { status: string }) {
    const steps = [
        "Order Placed",
        "RM Assigned",
        "Executive Assigned",
        "Pickup Completed",
    ];

    const statusStr = (status || '').toLowerCase();
    
    let completedSteps = 1;
    if (statusStr.includes('complete') || statusStr.includes('paid') || statusStr.includes('success')) completedSteps = 4;
    else if (statusStr.includes('executive') || statusStr.includes('rider') || statusStr.includes('field') || statusStr.includes('out for')) completedSteps = 3;
    else if (statusStr.includes('rm assigned') || statusStr.includes('manager') || statusStr.includes('assigned')) completedSteps = 2;

    return (
        <div className="w-full py-4 mb-6 mt-2 relative">
            {/* Background Line */}
            <div className="absolute top-[34px] left-[15%] right-[15%] h-[3px] bg-muted z-0 rounded-full" />
            <div 
                className="absolute top-[34px] left-[15%] h-[3px] bg-green-500 z-0 rounded-full transition-all duration-700 ease-in-out" 
                style={{ width: `${Math.min(100, Math.max(0, (completedSteps - 1) * (100 / (steps.length - 1)))) * 0.7}%` }} 
            />
            
            <div className="flex justify-between items-start relative z-10">
                {steps.map((step, idx) => {
                    const isCompleted = idx < completedSteps;
                    const isPending = idx === completedSteps;

                    return (
                        <div key={step} className="flex flex-col items-center gap-2 relative z-10 w-1/4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all duration-500 bg-card ${
                                isCompleted ? 'border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 
                                isPending ? 'border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 
                                'border-muted text-muted-foreground'
                            }`}>
                                {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : <span className="font-bold">{idx + 1}</span>}
                            </div>
                            <span className={`text-[11px] sm:text-xs font-bold text-center px-1 leading-tight ${
                                isCompleted ? 'text-green-600 dark:text-green-500' :
                                isPending ? 'text-amber-600 dark:text-amber-500' :
                                'text-muted-foreground'
                            }`}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
