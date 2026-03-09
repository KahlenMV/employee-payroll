

export interface PayrollInput {
    baseSalary: number;
    housingAllowance: number;
    transportAllowance: number;
    mealSubsidy: number;
    bonusAmount: number;
    filingStatus: string;
    exemptions: number;
}

export interface PayrollResult {
    grossPay: number;
    allowanceTotal: number;
    taxableIncome: number;
    incomeTax: number;
    ficaTax: number;
    netPay: number;
}

export function calculatePayroll(input: PayrollInput, taxBrackets: any[]): PayrollResult {
    const {
        baseSalary,
        housingAllowance,
        transportAllowance,
        mealSubsidy,
        bonusAmount,
        filingStatus,
        exemptions
    } = input;

    // 1. Gross Pay
    const allowanceTotal = housingAllowance + transportAllowance + mealSubsidy;
    const grossPay = baseSalary + allowanceTotal + bonusAmount;

    // 2. Pre-tax deductions (Standard deduction for demo)
    // For simplicity, we'll use a fixed standard deduction if no brackets are provided
    const standardDeduction = filingStatus === 'MARRIED_FILING_JOINTLY' ? 29200 : 14600;
    const taxableIncome = Math.max(0, grossPay - standardDeduction - (exemptions * 4000));

    // 3. Progressive Income Tax
    let incomeTax = 0;
    const matchingBrackets = taxBrackets
        .filter(b => b.filingStatus === filingStatus)
        .sort((a, b) => Number(a.minAmount) - Number(b.minAmount));

    if (matchingBrackets.length > 0) {
        let remainingTaxable = taxableIncome;
        for (const bracket of matchingBrackets) {
            const min = Number(bracket.minAmount);
            const max = bracket.maxAmount ? Number(bracket.maxAmount) : Infinity;
            const rate = Number(bracket.rate);

            if (remainingTaxable > min) {
                const taxableInBracket = Math.min(remainingTaxable, max) - min;
                incomeTax += taxableInBracket * rate;
            }
        }
    } else {
        // Fallback: simple 15% flat tax for demo
        incomeTax = taxableIncome * 0.15;
    }

    // 4. FICA (Social Security + Medicare)
    // Social Security: 6.2% up to $168,600
    // Medicare: 1.45%
    const ssTax = Math.min(grossPay, 168600) * 0.062;
    const medicareTax = grossPay * 0.0145;
    const ficaTax = ssTax + medicareTax;

    // 5. Net Pay
    const netPay = grossPay - incomeTax - ficaTax;

    return {
        grossPay,
        allowanceTotal,
        taxableIncome,
        incomeTax,
        ficaTax,
        netPay
    };
}
