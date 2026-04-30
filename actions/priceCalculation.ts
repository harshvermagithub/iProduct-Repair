'use server';

import { db } from '@/lib/store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function calculatePrice(basePrice: number, answers: Record<string, any>, category: string = 'smartphone') {
    let finalPrice = basePrice;

    // Fetch rules
    const rules = await db.getEvaluationRules(category);

    if (rules.length === 0) {
        // Fallback to legacy hardcoded logic if no rules are set in DB
        // This ensures the app still works reasonably until Admin configures it.
        if (category === 'smartphone') {
            if (answers.calls === false) finalPrice *= 0.8;
            if (answers.touch === false) finalPrice *= 0.7;
            if (answers.screen_original === false) finalPrice *= 0.9;

            // Screen Condition Deductions
            const screen = answers.physical_condition as string;
            if (screen === 'good') finalPrice -= basePrice * 0.10;
            else if (screen === 'average') finalPrice -= basePrice * 0.20;
            else if (screen === 'below_average') finalPrice -= basePrice * 0.35;

            // Body Condition Deductions
            const body = answers.body_condition as string;
            if (body === 'good') finalPrice -= basePrice * 0.05;
            else if (body === 'average') finalPrice -= basePrice * 0.10;
            else if (body === 'below_average') finalPrice -= basePrice * 0.20;

            // Functional Problems (4% per issue)
            const problems = answers.functional_issues as string[] | undefined;
            if (problems && problems.length > 0) {
                finalPrice -= (basePrice * 0.04 * problems.length);
            }

            // Warranty (Bonus)
            const warranty = answers.warranty as string;
            if (warranty === '0_3_months') finalPrice += basePrice * 0.05;
            else if (warranty === '3_6_months') finalPrice += basePrice * 0.07;
            else if (warranty === '6_11_months') finalPrice += basePrice * 0.10;

            // Accessories (Deductions if missing)
            const accessories = answers.accessories as string[] | undefined;
            if (!accessories?.includes('charger')) finalPrice -= 500;
            if (!accessories?.includes('box')) finalPrice -= 300;
            if (!accessories?.includes('bill')) finalPrice -= basePrice * 0.15;
        } else if (category === 'laptop') {
            // Laptop legacy hardcoded logic
            if (answers.power === false) finalPrice -= basePrice * 0.50;
            if (answers.ports === false) finalPrice -= basePrice * 0.10;
            if (answers.screen_working === false) finalPrice -= basePrice * 0.40;
            if (answers.keyboard === false) finalPrice -= basePrice * 0.15;

            const phys = answers.physical_condition as string[] || [];
            if (phys.includes('screen_damage')) finalPrice -= basePrice * 0.30;
            if (phys.includes('body_damage')) finalPrice -= basePrice * 0.20;
            if (phys.includes('battery_dead')) finalPrice -= basePrice * 0.15;
            if (phys.includes('keys_missing')) finalPrice -= basePrice * 0.10;

            const specs = answers.specs as string[] || [];
            if (specs.includes('charger_missing')) finalPrice -= 1500;
            if (specs.includes('box_missing')) finalPrice -= 500;
        } else if (category === 'tablet') {
            // Tablet legacy hardcoded logic
            if (answers.power === false) finalPrice *= 0.50;
            if (answers.touch === false) finalPrice *= 0.70;
            if (answers.wifi === false) finalPrice *= 0.85;

            // Screen Condition Deductions
            const screen = answers.physical_condition as string;
            if (screen === 'good') finalPrice -= basePrice * 0.10;
            else if (screen === 'average') finalPrice -= basePrice * 0.20;
            else if (screen === 'below_average') finalPrice -= basePrice * 0.35;

            // Body Condition Deductions
            const body = answers.body_condition as string;
            if (body === 'good') finalPrice -= basePrice * 0.05;
            else if (body === 'average') finalPrice -= basePrice * 0.10;
            else if (body === 'below_average') finalPrice -= basePrice * 0.20;

            // Functional Problems (4% per issue)
            const problems = answers.functional_issues as string[] | undefined;
            if (problems && problems.length > 0) {
                finalPrice -= (basePrice * 0.04 * problems.length);
            }

            // Warranty (Bonus)
            const warranty = answers.warranty as string;
            if (warranty === '0_3_months') finalPrice += basePrice * 0.05;
            else if (warranty === '3_6_months') finalPrice += basePrice * 0.07;
            else if (warranty === '6_11_months') finalPrice += basePrice * 0.10;

            // Accessories (Deductions if missing)
            const accessories = answers.accessories as string[] | undefined;
            if (!accessories?.includes('charger')) finalPrice -= 500;
            if (!accessories?.includes('box')) finalPrice -= 300;
            if (!accessories?.includes('bill')) finalPrice -= basePrice * 0.15;
        } else if (category === 'watch') {
            // Smartwatch legacy hardcoded logic
            if (answers.power === false) finalPrice -= basePrice * 0.50;
            if (answers.touch === false) finalPrice -= basePrice * 0.30;
            if (answers.charging === false) finalPrice -= basePrice * 0.15;

            // Screen Condition Deductions
            const screen = answers.physical_condition as string;
            if (screen === 'good') finalPrice -= basePrice * 0.08;
            else if (screen === 'average') finalPrice -= basePrice * 0.18;
            else if (screen === 'damaged') finalPrice -= basePrice * 0.35;

            // Body Condition Deductions
            const body = answers.body_condition as string;
            if (body === 'good') finalPrice -= basePrice * 0.05;
            else if (body === 'average') finalPrice -= basePrice * 0.12;
            else if (body === 'below_average') finalPrice -= basePrice * 0.25;

            // Functional Problems (5% per issue)
            const problems = answers.functional_issues as string[] | undefined;
            if (problems && problems.length > 0) {
                finalPrice -= (basePrice * 0.05 * problems.length);
            }

            // Warranty (Bonus)
            const warranty = answers.warranty as string;
            if (warranty === '0_3_months') finalPrice += basePrice * 0.05;
            else if (warranty === '3_6_months') finalPrice += basePrice * 0.07;
            else if (warranty === '6_11_months') finalPrice += basePrice * 0.10;

            // Accessories (Deductions if missing)
            const accessories = answers.accessories as string[] | undefined;
            if (!accessories?.includes('charger')) finalPrice -= 400;
            if (!accessories?.includes('strap')) finalPrice -= 300;
            if (!accessories?.includes('box')) finalPrice -= 200;
            if (!accessories?.includes('bill')) finalPrice -= basePrice * 0.10;
        } else if (category === 'camera') {
            // Camera legacy hardcoded logic
            if (answers.power === false) finalPrice -= basePrice * 0.50;
            if (answers.lens_focus === false) finalPrice -= basePrice * 0.30;
            if (answers.sensor_spots === true) finalPrice -= basePrice * 0.25;
            if (answers.flash === false) finalPrice -= basePrice * 0.10;

            // Physical Condition (Body)
            const body = answers.physical_condition as string;
            if (body === 'good') finalPrice -= basePrice * 0.10;
            else if (body === 'average') finalPrice -= basePrice * 0.20;
            else if (body === 'below_average') finalPrice -= basePrice * 0.35;

            // Screen/Viewfinder Condition
            const screen = answers.screen_condition as string;
            if (screen === 'cracked') finalPrice -= basePrice * 0.30;
            else if (screen === 'dead_pixels') finalPrice -= basePrice * 0.20;

            // Functional Problems (5% per issue)
            const problems = answers.functional_issues as string[] | undefined;
            if (problems && problems.length > 0) {
                finalPrice -= (basePrice * 0.05 * problems.length);
            }

            // Warranty (Bonus)
            const warranty = answers.warranty as string;
            if (warranty === '0_3_months') finalPrice += basePrice * 0.05;
            else if (warranty === '3_6_months') finalPrice += basePrice * 0.07;
            else if (warranty === '6_11_months') finalPrice += basePrice * 0.10;

            // Accessories (Deductions if missing)
            const accessories = answers.accessories as string[] | undefined;
            if (!accessories?.includes('battery')) finalPrice -= 1000;
            if (!accessories?.includes('charger')) finalPrice -= 1000;
            if (!accessories?.includes('lens_cap')) finalPrice -= 200;
            if (!accessories?.includes('strap')) finalPrice -= 200;
            if (!accessories?.includes('box')) finalPrice -= 300;
            if (!accessories?.includes('bill')) finalPrice -= basePrice * 0.15;
        }
    } else {
        // Apply DB Rules
        for (const rule of rules) {
            const answer = answers[rule.questionKey];

            // Boolean check
            if (typeof answer === 'boolean') {
                const ruleVal = rule.answerKey === 'true';
                if (answer === ruleVal) {
                    applyRule(rule);
                }
            }
            // Array check (multi-select)
            else if (Array.isArray(answer)) {
                if (rule.answerKey.startsWith('!')) {
                    const target = rule.answerKey.substring(1);
                    if (!answer.includes(target)) {
                        applyRule(rule);
                    }
                } else if (answer.includes(rule.answerKey)) {
                    applyRule(rule);
                }
            }
            // String check (single-select)
            else if (typeof answer === 'string') {
                if (answer === rule.answerKey) {
                    applyRule(rule);
                }
            }
        }
    }

    function applyRule(rule: any) {
        if (rule.deductionAmount !== 0) {
            finalPrice -= rule.deductionAmount;
        }
        if (rule.deductionPercent !== 0) {
            finalPrice -= (basePrice * (rule.deductionPercent / 100));
        }
    }

    // Ensure final price is never zero and has a minimum floor based on device value and condition
    let minPrice = 400; // Minimum floor of 400 for all other devices as requested

    if (basePrice >= 50000) {
        const cond = (typeof answers.physical_condition === 'string') ? answers.physical_condition : 'below_average';
        if (cond === 'flawless' || cond === 'good') minPrice = 1800;
        else if (cond === 'average') minPrice = 1200;
        else minPrice = 500;
    }

    return Math.floor(Math.max(finalPrice, minPrice));
}
