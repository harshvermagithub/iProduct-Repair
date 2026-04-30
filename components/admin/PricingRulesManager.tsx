'use client';

import React, { useState, useEffect } from 'react';
import { questionnaireSteps } from '@/lib/data';
import { upsertEvaluationRule } from '@/actions/admin';
import { Loader2, Save, Undo2 } from 'lucide-react';

interface Props {
    category: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialRules: any[];
}

// Default values for prefilling if DB is empty
const PREFILL_DEFAULTS: Record<string, { amount: number, percent: number }> = {
    // Condition
    'flawless': { amount: 0, percent: 0 },
    'good': { amount: 0, percent: 15 },
    'average': { amount: 0, percent: 30 },
    'below_average': { amount: 0, percent: 50 },

    // Functional Issues (Common)
    'wifi': { amount: 1000, percent: 0 },
    'bluetooth': { amount: 500, percent: 0 },
    'camera': { amount: 1500, percent: 0 },
    'front_camera': { amount: 1200, percent: 0 },
    'back_camera': { amount: 2000, percent: 0 },
    'camera_glass': { amount: 500, percent: 0 },
    'speaker': { amount: 800, percent: 0 },
    'battery': { amount: 1200, percent: 0 },
    'display': { amount: 3000, percent: 0 },
    'face_sensor': { amount: 2000, percent: 0 },
    'finger_sensor': { amount: 800, percent: 0 },
    'charging_port': { amount: 800, percent: 0 },
    'volume_button': { amount: 500, percent: 0 },
    'power_button': { amount: 500, percent: 0 },
    'power': { amount: 2000, percent: 0 }, // Generic power issue
    'touch': { amount: 2500, percent: 0 },
    'screen': { amount: 3000, percent: 0 },

    // Accessories
    'charger': { amount: 800, percent: 0 }, // Value of missing charger
    'box': { amount: 300, percent: 0 },
    'bill': { amount: 500, percent: 0 },

    // Warranty
    'no': { amount: 0, percent: 10 }, // 10% deduction if no warranty
};

export default function PricingRulesManager({ category, initialRules }: Props) {
    // Flatten steps to get all configurable items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const steps = (questionnaireSteps as any)[category] || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [rules, setRules] = useState<any[]>(initialRules);

    const getRule = (qKey: string, aKey: string) => {
        return rules.find(r => r.questionKey === qKey && r.answerKey === aKey);
    };

    const handleSave = async (qKey: string, aKey: string, label: string, amount: number, percent: number) => {
        try {
            await upsertEvaluationRule({
                category,
                questionKey: qKey,
                answerKey: aKey,
                label,
                deductionAmount: parseInt(amount.toString()),
                deductionPercent: parseFloat(percent.toString())
            });
            setRules(prev => {
                const existingIdx = prev.findIndex(r => r.questionKey === qKey && r.answerKey === aKey);
                const newRule = { questionKey: qKey, answerKey: aKey, label, deductionAmount: amount, deductionPercent: percent };
                if (existingIdx >= 0) {
                    const next = [...prev];
                    next[existingIdx] = newRule;
                    return next;
                }
                return [...prev, newRule];
            });
        } catch (error) {
            console.error(error);
            alert('Failed to save rule');
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold">Deduction Rules</h3>
            <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground border-b">
                        <tr>
                            <th className="p-4 font-semibold w-1/3">Configurable Item</th>
                            <th className="p-4 font-semibold w-1/4">Scenario / Issue</th>
                            <th className="p-4 font-semibold w-32">Deduction (₹)</th>
                            <th className="p-4 font-semibold w-24">Deduction (%)</th>
                            <th className="p-4 font-semibold w-16 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {steps.map((step: any, idx: number) => (
                            <React.Fragment key={step.id || idx}>
                                {/* Boolean Questions - "No" usually implies bad condition for functionality checks */}
                                {step.questions?.map((q: any) => (
                                    <RuleRow
                                        key={q.id}
                                        category={category}
                                        qId={q.id}
                                        aId="false"
                                        qLabel={q.text}
                                        aLabel="Defective / No"
                                        initialRule={getRule(q.id, 'false')}
                                        defaults={PREFILL_DEFAULTS[q.id]}
                                        onSave={handleSave}
                                    />
                                ))}

                                {/* Multi-Select Options */}
                                {step.options?.map((opt: any) => {
                                    const isAccessory = step.id === 'accessories' || opt.id === 'charger' || opt.id === 'box' || opt.id === 'bill';
                                    const aId = isAccessory ? `!${opt.id}` : opt.id;
                                    const aLabel = isAccessory ? `Missing ${opt.label}` : opt.label;

                                    return (
                                        <RuleRow
                                            key={opt.id}
                                            category={category}
                                            qId={step.id}
                                            aId={aId}
                                            qLabel={step.title}
                                            aLabel={aLabel}
                                            initialRule={getRule(step.id, aId)}
                                            defaults={PREFILL_DEFAULTS[opt.id]}
                                            onSave={handleSave}
                                        />
                                    );
                                })}
                                {/* Combined-Step Sections (e.g. Laptops / Device Details) */}
                                {step.type === 'combined-step' && step.sections?.map((section: any) => (
                                    <React.Fragment key={section.id}>
                                        {section.options?.map((opt: any) => {
                                            const isAccessory = section.id === 'accessories' || opt.id === 'charger' || opt.id === 'box' || opt.id === 'bill';
                                            const aId = isAccessory ? `!${opt.id}` : opt.id;
                                            const aLabel = isAccessory ? `Missing ${opt.label}` : opt.label;
                                            
                                            return (
                                                <RuleRow
                                                    key={opt.id}
                                                    category={category}
                                                    qId={section.id}
                                                    aId={aId}
                                                    qLabel={`${step.title} - ${section.title}`}
                                                    aLabel={aLabel}
                                                    initialRule={getRule(section.id, aId)}
                                                    defaults={PREFILL_DEFAULTS[opt.id]}
                                                    onSave={handleSave}
                                                />
                                            );
                                        })}
                                    </React.Fragment>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 text-xs text-blue-700 dark:text-blue-300 flex gap-3">
                <div className="mt-0.5 font-bold text-lg">ℹ</div>
                <div>
                    <strong className="block mb-1">Pricing Logic Guide</strong>
                    Percentages are applied to the Base Price first. Fixed amounts are deducted afterwards.<br />
                    Example: Base ₹10,000. Rule: 10% + ₹500.<br />
                    Calculation: ₹10,000 - (10% of 10k) - ₹500 = ₹8,500.
                </div>
            </div>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RuleRow({ category, qId, aId, qLabel, aLabel, initialRule, defaults, onSave }: any) {
    const defaultAmount = defaults?.amount || 0;
    const defaultPercent = defaults?.percent || 0;

    // Use DB value if exists, otherwise default
    const effectiveAmount = initialRule ? initialRule.deductionAmount : defaultAmount;
    const effectivePercent = initialRule ? initialRule.deductionPercent : defaultPercent;

    const [amount, setAmount] = useState<string | number>(effectiveAmount);
    const [percent, setPercent] = useState<string | number>(effectivePercent);
    const [isDirty, setIsDirty] = useState(false);
    const [saved, setSaved] = useState(false);

    // If props change (e.g. navigation), reset state
    useEffect(() => {
        setAmount(effectiveAmount);
        setPercent(effectivePercent);
    }, [effectiveAmount, effectivePercent]);

    const handleSave = async () => {
        await onSave(qId, aId, aLabel, Number(amount), Number(percent));
        setIsDirty(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <tr className="hover:bg-muted/30 transition-colors group">
            <td className="p-4 font-medium text-foreground/80">
                <span className="line-clamp-1" title={qLabel}>{qLabel}</span>
            </td>
            <td className="p-4">
                <span className="font-semibold text-foreground">{aLabel}</span>
            </td>
            <td className="p-4">
                <div className="flex items-center border rounded-md overflow-hidden bg-background focus-within:ring-2 ring-primary/20 focus-within:border-primary/50 transition-all shadow-sm">
                    <div className="px-3 py-2 bg-muted/50 text-muted-foreground text-xs font-medium border-r shrink-0">₹</div>
                    <input
                        type="number"
                        value={amount}
                        onChange={e => { setAmount(e.target.value); setIsDirty(true); }}
                        disabled={Number(percent) > 0}
                        className="w-full p-2 border-0 outline-none bg-transparent text-sm w-24 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="0"
                    />
                </div>
            </td>
            <td className="p-4">
                <div className="flex items-center border rounded-md overflow-hidden bg-background focus-within:ring-2 ring-primary/20 focus-within:border-primary/50 transition-all shadow-sm">
                    <input
                        type="number"
                        value={percent}
                        onChange={e => { setPercent(e.target.value); setIsDirty(true); }}
                        disabled={Number(amount) > 0}
                        className="w-full p-2 border-0 outline-none bg-transparent text-sm w-16 disabled:opacity-50 disabled:cursor-not-allowed"
                        step="1"
                        placeholder="0"
                    />
                    <div className="px-2 py-2 bg-muted/50 text-muted-foreground text-xs font-medium border-l shrink-0">%</div>
                </div>
            </td>
            <td className="p-4 text-right">
                {(isDirty || (!initialRule && (defaultAmount > 0 || defaultPercent > 0))) ? (
                    <button
                        onClick={handleSave}
                        className={`inline-flex items-center justify-center p-2 rounded-lg transition-all shadow-sm ${isDirty
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                            }`}
                        title={isDirty ? "Save Changes" : "Confirm Default"}
                    >
                        <Save className="w-4 h-4" />
                    </button>
                ) : saved ? (
                    <span className="text-emerald-500 font-bold text-xs animate-in fade-in flex items-center justify-end gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Saved
                    </span>
                ) : (
                    <span className="text-muted-foreground/30 text-xs">--</span>
                )}
            </td>
        </tr>
    );
}
