document.addEventListener('DOMContentLoaded', () => {
    const formulaListNav = document.getElementById('formula-list-nav');
    const formulaTitle = document.getElementById('formula-title');
    const formulaDescription = document.getElementById('formula-description');
    const calculatorForm = document.getElementById('calculator-form');
    const resultArea = document.getElementById('result-area');
    const clearButton = document.getElementById('clear-button');
    const errorMessageArea = document.getElementById('error-message-area');
    const formulaSearch = document.getElementById('formula-search');
    const formula22OutputArea = document.getElementById('formula-22-output');

    let activeFormula = null;
    let activeFormulaInputs = [];

    const formulas = {
        "Basic Profitability & Cost Structure": [
            {
                id: "revenue",
                name: "Revenue",
                description: "Revenue = Sales Price per unit × Sales Volume (units)",
                variables: [
                    { id: "revenue", label: "Revenue ($)", placeholder: "e.g., 10000" },
                    { id: "salesPricePerUnit", label: "Sales Price per Unit ($)", placeholder: "e.g., 50" },
                    { id: "salesVolume", label: "Sales Volume (units)", placeholder: "e.g., 200" }
                ],
                calculate: (values) => {
                    const { revenue, salesPricePerUnit, salesVolume } = values;
                    if (revenue === null && salesPricePerUnit !== null && salesVolume !== null) {
                        return { revenue: salesPricePerUnit * salesVolume };
                    }
                    if (salesPricePerUnit === null && revenue !== null && salesVolume !== null) {
                        if (salesVolume === 0) throw new Error("Cannot divide by zero (Sales Volume).");
                        return { salesPricePerUnit: revenue / salesVolume };
                    }
                    if (salesVolume === null && revenue !== null && salesPricePerUnit !== null) {
                        if (salesPricePerUnit === 0) throw new Error("Cannot divide by zero (Sales Price per Unit).");
                        return { salesVolume: revenue / salesPricePerUnit };
                    }
                    return null;
                }
            },
            {
                id: "contribution_from_revenue",
                name: "Contribution (from Revenue)",
                description: "Contribution = Revenue – Variable Costs",
                variables: [
                    { id: "contribution", label: "Contribution ($)", placeholder: "e.g., 6000" },
                    { id: "revenue", label: "Revenue ($)", placeholder: "e.g., 10000" },
                    { id: "variableCosts", label: "Variable Costs ($)", placeholder: "e.g., 4000" }
                ],
                calculate: (values) => {
                    const { contribution, revenue, variableCosts } = values;
                    if (contribution === null && revenue !== null && variableCosts !== null) {
                        return { contribution: revenue - variableCosts };
                    }
                    if (revenue === null && contribution !== null && variableCosts !== null) {
                        return { revenue: contribution + variableCosts };
                    }
                    if (variableCosts === null && contribution !== null && revenue !== null) {
                        return { variableCosts: revenue - contribution };
                    }
                    return null;
                }
            },
            {
                id: "contribution_from_profit",
                name: "Contribution (from Profit)",
                description: "Contribution = Operating Profit + Fixed Costs",
                variables: [
                    { id: "contribution", label: "Contribution ($)", placeholder: "e.g., 6000" },
                    { id: "operatingProfit", label: "Operating Profit ($)", placeholder: "e.g., 4000" },
                    { id: "fixedCosts", label: "Fixed Costs ($)", placeholder: "e.g., 2000" }
                ],
                calculate: (values) => {
                    const { contribution, operatingProfit, fixedCosts } = values;
                    if (contribution === null && operatingProfit !== null && fixedCosts !== null) {
                        return { contribution: operatingProfit + fixedCosts };
                    }
                    if (operatingProfit === null && contribution !== null && fixedCosts !== null) {
                        return { operatingProfit: contribution - fixedCosts };
                    }
                    if (fixedCosts === null && contribution !== null && operatingProfit !== null) {
                        return { fixedCosts: contribution - operatingProfit };
                    }
                    return null;
                }
            },
            {
                id: "operating_profit_from_revenue",
                name: "Operating Profit (from Revenue)",
                description: "Operating Profit = Revenue – Operating Costs (OpCosts = VarCosts + FixedCosts)",
                variables: [
                    { id: "operatingProfit", label: "Operating Profit ($)", placeholder: "e.g., 4000" },
                    { id: "revenue", label: "Revenue ($)", placeholder: "e.g., 10000" },
                    { id: "variableCosts", label: "Variable Costs ($)", placeholder: "e.g., 4000" },
                    { id: "fixedCosts", label: "Fixed Costs ($)", placeholder: "e.g., 2000" }
                ],
                calculate: (values) => {
                    const { operatingProfit, revenue, variableCosts, fixedCosts } = values;
                    const operatingCosts = (variableCosts !== null && fixedCosts !== null) ? variableCosts + fixedCosts : null;

                    if (operatingProfit === null && revenue !== null && operatingCosts !== null) {
                        return { operatingProfit: revenue - operatingCosts };
                    }
                    if (revenue === null && operatingProfit !== null && operatingCosts !== null) {
                        return { revenue: operatingProfit + operatingCosts };
                    }
                    // Solving for variableCosts or fixedCosts requires one of them and other primary vars
                    if (variableCosts === null && revenue !== null && operatingProfit !== null && fixedCosts !== null) {
                        return { variableCosts: revenue - operatingProfit - fixedCosts };
                    }
                    if (fixedCosts === null && revenue !== null && operatingProfit !== null && variableCosts !== null) {
                        return { fixedCosts: revenue - operatingProfit - variableCosts };
                    }
                    return null;
                }
            },
            {
                id: "operating_profit_from_contribution",
                name: "Operating Profit (from Contribution)",
                description: "Operating Profit = Contribution – Fixed Costs",
                variables: [
                    { id: "operatingProfit", label: "Operating Profit ($)", placeholder: "e.g., 4000" },
                    { id: "contribution", label: "Contribution ($)", placeholder: "e.g., 6000" },
                    { id: "fixedCosts", label: "Fixed Costs ($)", placeholder: "e.g., 2000" }
                ],
                calculate: (values) => {
                    const { operatingProfit, contribution, fixedCosts } = values;
                    if (operatingProfit === null && contribution !== null && fixedCosts !== null) {
                        return { operatingProfit: contribution - fixedCosts };
                    }
                    if (contribution === null && operatingProfit !== null && fixedCosts !== null) {
                        return { contribution: operatingProfit + fixedCosts };
                    }
                    if (fixedCosts === null && contribution !== null && operatingProfit !== null) {
                        return { fixedCosts: contribution - operatingProfit };
                    }
                    return null;
                }
            }
        ],
        "Profitability Ratios & Advanced Financial Metrics": [
            {
                id: "op_profit_margin",
                name: "Operating Profit Margin (%)",
                description: "Operating Profit Margin (%) = (Operating Profit / Revenue) × 100",
                variables: [
                    { id: "opProfitMargin", label: "Operating Profit Margin (%)", placeholder: "e.g., 40", isPercentageOutput: true },
                    { id: "operatingProfit", label: "Operating Profit ($)", placeholder: "e.g., 4000" },
                    { id: "revenue", label: "Revenue ($)", placeholder: "e.g., 10000" }
                ],
                calculate: (values) => {
                    const { opProfitMargin, operatingProfit, revenue } = values;
                    if (opProfitMargin === null && operatingProfit !== null && revenue !== null) {
                        if (revenue === 0) throw new Error("Cannot divide by zero (Revenue).");
                        return { opProfitMargin: (operatingProfit / revenue) * 100 };
                    }
                    if (operatingProfit === null && opProfitMargin !== null && revenue !== null) {
                        return { operatingProfit: (opProfitMargin / 100) * revenue };
                    }
                    if (revenue === null && opProfitMargin !== null && operatingProfit !== null) {
                        if (opProfitMargin === 0) throw new Error("Cannot divide by zero (Operating Profit Margin).");
                        return { revenue: operatingProfit / (opProfitMargin / 100) };
                    }
                    return null;
                }
            },
            {
                id: "roic",
                name: "Return on Invested Capital (ROIC) (%)",
                description: "ROIC (%) = (Operating Profit / Invested Capital) × 100",
                variables: [
                    { id: "roic", label: "ROIC (%)", placeholder: "e.g., 20", isPercentageOutput: true },
                    { id: "operatingProfit", label: "Operating Profit ($)", placeholder: "e.g., 4000" },
                    { id: "investedCapital", label: "Invested Capital ($)", placeholder: "e.g., 20000" }
                ],
                calculate: (values) => {
                    const { roic, operatingProfit, investedCapital } = values;
                    if (roic === null && operatingProfit !== null && investedCapital !== null) {
                        if (investedCapital === 0) throw new Error("Cannot divide by zero (Invested Capital).");
                        return { roic: (operatingProfit / investedCapital) * 100 };
                    }
                    if (operatingProfit === null && roic !== null && investedCapital !== null) {
                        return { operatingProfit: (roic / 100) * investedCapital };
                    }
                    if (investedCapital === null && roic !== null && operatingProfit !== null) {
                        if (roic === 0) throw new Error("Cannot divide by zero (ROIC).");
                        return { investedCapital: operatingProfit / (roic / 100) };
                    }
                    return null;
                }
            },
            {
                id: "financing_costs",
                name: "Financing Costs",
                description: "Financing Costs = Invested Capital × Cost of Invested Capital (COIC %)",
                variables: [
                    { id: "financingCosts", label: "Financing Costs ($)", placeholder: "e.g., 2000" },
                    { id: "investedCapital", label: "Invested Capital ($)", placeholder: "e.g., 20000" },
                    { id: "coic", label: "COIC (%)", placeholder: "e.g., 10", isPercentageInput: true }
                ],
                calculate: (values) => {
                    const { financingCosts, investedCapital, coic } = values;
                    const coicDecimal = coic !== null ? coic / 100 : null;

                    if (financingCosts === null && investedCapital !== null && coicDecimal !== null) {
                        return { financingCosts: investedCapital * coicDecimal };
                    }
                    if (investedCapital === null && financingCosts !== null && coicDecimal !== null) {
                        if (coicDecimal === 0) throw new Error("Cannot divide by zero (COIC).");
                        return { investedCapital: financingCosts / coicDecimal };
                    }
                    if (coic === null && financingCosts !== null && investedCapital !== null) {
                        if (investedCapital === 0) throw new Error("Cannot divide by zero (Invested Capital).");
                        return { coic: (financingCosts / investedCapital) * 100 };
                    }
                    return null;
                }
            },
            {
                id: "ep_from_financing_costs",
                name: "Economic Profit (EP from Financing Costs)",
                description: "Economic Profit (EP) = Operating Profit – Financing Costs",
                variables: [
                    { id: "economicProfit", label: "Economic Profit ($)", placeholder: "e.g., 2000" },
                    { id: "operatingProfit", label: "Operating Profit ($)", placeholder: "e.g., 4000" },
                    { id: "financingCosts", label: "Financing Costs ($)", placeholder: "e.g., 2000" }
                ],
                calculate: (values) => {
                    const { economicProfit, operatingProfit, financingCosts } = values;
                    if (economicProfit === null && operatingProfit !== null && financingCosts !== null) {
                        return { economicProfit: operatingProfit - financingCosts };
                    }
                    if (operatingProfit === null && economicProfit !== null && financingCosts !== null) {
                        return { operatingProfit: economicProfit + financingCosts };
                    }
                    if (financingCosts === null && economicProfit !== null && operatingProfit !== null) {
                        return { financingCosts: operatingProfit - economicProfit };
                    }
                    return null;
                }
            },
            {
                id: "ep_from_ic_coic",
                name: "Economic Profit (EP from IC & COIC)",
                description: "Economic Profit (EP) = Operating Profit – (Invested Capital × COIC %)",
                variables: [
                    { id: "economicProfit", label: "Economic Profit ($)", placeholder: "e.g., 2000" },
                    { id: "operatingProfit", label: "Operating Profit ($)", placeholder: "e.g., 4000" },
                    { id: "investedCapital", label: "Invested Capital ($)", placeholder: "e.g., 20000" },
                    { id: "coic", label: "COIC (%)", placeholder: "e.g., 10", isPercentageInput: true }
                ],
                calculate: (values) => {
                    const { economicProfit, operatingProfit, investedCapital, coic } = values;
                    const coicDecimal = coic !== null ? coic / 100 : null;

                    if (economicProfit === null && operatingProfit !== null && investedCapital !== null && coicDecimal !== null) {
                        return { economicProfit: operatingProfit - (investedCapital * coicDecimal) };
                    }
                    if (operatingProfit === null && economicProfit !== null && investedCapital !== null && coicDecimal !== null) {
                        return { operatingProfit: economicProfit + (investedCapital * coicDecimal) };
                    }
                    if (investedCapital === null && economicProfit !== null && operatingProfit !== null && coicDecimal !== null) {
                        if (coicDecimal === 0) throw new Error("COIC cannot be zero if solving for Invested Capital.");
                        return { investedCapital: (operatingProfit - economicProfit) / coicDecimal };
                    }
                    if (coic === null && economicProfit !== null && operatingProfit !== null && investedCapital !== null) {
                        if (investedCapital === 0) throw new Error("Invested Capital cannot be zero if solving for COIC.");
                        return { coic: ((operatingProfit - economicProfit) / investedCapital) * 100 };
                    }
                    return null;
                }
            },
            {
                id: "ep_from_roic_coic",
                name: "Economic Profit (EP from ROIC & COIC)",
                description: "Economic Profit (EP) = (ROIC % – COIC %) × Invested Capital",
                variables: [
                    { id: "economicProfit", label: "Economic Profit ($)", placeholder: "e.g., 2000" },
                    { id: "roic", label: "ROIC (%)", placeholder: "e.g., 20", isPercentageInput: true },
                    { id: "coic", label: "COIC (%)", placeholder: "e.g., 10", isPercentageInput: true },
                    { id: "investedCapital", label: "Invested Capital ($)", placeholder: "e.g., 20000" }
                ],
                calculate: (values) => {
                    const { economicProfit, roic, coic, investedCapital } = values;
                    const roicDecimal = roic !== null ? roic / 100 : null;
                    const coicDecimal = coic !== null ? coic / 100 : null;

                    if (economicProfit === null && roicDecimal !== null && coicDecimal !== null && investedCapital !== null) {
                        return { economicProfit: (roicDecimal - coicDecimal) * investedCapital };
                    }
                    if (investedCapital === null && economicProfit !== null && roicDecimal !== null && coicDecimal !== null) {
                        const diff = roicDecimal - coicDecimal;
                        if (diff === 0) throw new Error("ROIC and COIC cannot be equal if solving for Invested Capital.");
                        return { investedCapital: economicProfit / diff };
                    }
                    if (roic === null && economicProfit !== null && coicDecimal !== null && investedCapital !== null) {
                        if (investedCapital === 0) throw new Error("Invested Capital cannot be zero if solving for ROIC.");
                        return { roic: ((economicProfit / investedCapital) + coicDecimal) * 100 };
                    }
                    if (coic === null && economicProfit !== null && roicDecimal !== null && investedCapital !== null) {
                        if (investedCapital === 0) throw new Error("Invested Capital cannot be zero if solving for COIC.");
                        return { coic: (roicDecimal - (economicProfit / investedCapital)) * 100 };
                    }
                    return null;
                }
            }
        ],
        "Sensitivity & Decision Analysis": [
            {
                id: "operating_leverage",
                name: "Operating Leverage (Factor)",
                description: "Operating Leverage (Factor) = Contribution / Operating Profit",
                variables: [
                    { id: "operatingLeverage", label: "Operating Leverage (Factor)", placeholder: "e.g., 1.5" },
                    { id: "contribution", label: "Contribution ($)", placeholder: "e.g., 6000" },
                    { id: "operatingProfit", label: "Operating Profit ($)", placeholder: "e.g., 4000" }
                ],
                calculate: (values) => {
                    const { operatingLeverage, contribution, operatingProfit } = values;
                    if (operatingLeverage === null && contribution !== null && operatingProfit !== null) {
                        if (operatingProfit === 0) throw new Error("Cannot divide by zero (Operating Profit).");
                        return { operatingLeverage: contribution / operatingProfit };
                    }
                    if (contribution === null && operatingLeverage !== null && operatingProfit !== null) {
                        return { contribution: operatingLeverage * operatingProfit };
                    }
                    if (operatingProfit === null && operatingLeverage !== null && contribution !== null) {
                        if (operatingLeverage === 0) throw new Error("Cannot divide by zero (Operating Leverage).");
                        return { operatingProfit: contribution / operatingLeverage };
                    }
                    return null;
                }
            },
            {
                id: "change_op_profit",
                name: "% Change in Operating Profit",
                description: "% Change in Operating Profit = % Change in Sales Volume × Operating Leverage",
                variables: [
                    { id: "changeOpProfit", label: "% Change in Operating Profit (%)", placeholder: "e.g., 15", isPercentageOutput: true, isPercentageInput: false },
                    { id: "changeSalesVolume", label: "% Change in Sales Volume (%)", placeholder: "e.g., 10", isPercentageInput: true },
                    { id: "operatingLeverage", label: "Operating Leverage (Factor)", placeholder: "e.g., 1.5" }
                ],
                calculate: (values) => {
                    const { changeOpProfit, changeSalesVolume, operatingLeverage } = values;
                    // Note: changeSalesVolume is input as %, but used as decimal in calculation if solving for others.
                    // changeOpProfit is output as %, but derived from calculation.

                    if (changeOpProfit === null && changeSalesVolume !== null && operatingLeverage !== null) {
                        return { changeOpProfit: changeSalesVolume * operatingLeverage }; // Output is already a percentage value
                    }
                    if (changeSalesVolume === null && changeOpProfit !== null && operatingLeverage !== null) {
                        if (operatingLeverage === 0) throw new Error("Cannot divide by zero (Operating Leverage).");
                        return { changeSalesVolume: changeOpProfit / operatingLeverage };
                    }
                    if (operatingLeverage === null && changeOpProfit !== null && changeSalesVolume !== null) {
                        if (changeSalesVolume === 0) throw new Error("Cannot divide by zero (% Change in Sales Volume).");
                        return { operatingLeverage: changeOpProfit / changeSalesVolume };
                    }
                    return null;
                }
            },
            {
                id: "break_even_units",
                name: "Break-Even Units",
                description: "Break-Even Units = Fixed Costs / (Sales Price per Unit – Variable Cost per Unit)",
                variables: [
                    { id: "breakEvenUnits", label: "Break-Even Units", placeholder: "e.g., 100" },
                    { id: "fixedCosts", label: "Fixed Costs ($)", placeholder: "e.g., 2000" },
                    { id: "salesPricePerUnit", label: "Sales Price per Unit ($)", placeholder: "e.g., 50" },
                    { id: "varCostPerUnit", label: "Variable Cost per Unit ($)", placeholder: "e.g., 30" }
                ],
                calculate: (values) => {
                    const { breakEvenUnits, fixedCosts, salesPricePerUnit, varCostPerUnit } = values;
                    const contributionPerUnit = (salesPricePerUnit !== null && varCostPerUnit !== null) ? salesPricePerUnit - varCostPerUnit : null;

                    if (breakEvenUnits === null && fixedCosts !== null && contributionPerUnit !== null) {
                        if (contributionPerUnit === 0) throw new Error("Contribution per unit cannot be zero (Sales Price/unit equals VarCost/unit).");
                        return { breakEvenUnits: fixedCosts / contributionPerUnit };
                    }
                    if (fixedCosts === null && breakEvenUnits !== null && contributionPerUnit !== null) {
                        return { fixedCosts: breakEvenUnits * contributionPerUnit };
                    }
                    if (salesPricePerUnit === null && breakEvenUnits !== null && fixedCosts !== null && varCostPerUnit !== null) {
                        if (breakEvenUnits === 0) throw new Error("Break-Even Units cannot be zero when solving for price/cost.");
                        return { salesPricePerUnit: (fixedCosts / breakEvenUnits) + varCostPerUnit };
                    }
                    if (varCostPerUnit === null && breakEvenUnits !== null && fixedCosts !== null && salesPricePerUnit !== null) {
                        if (breakEvenUnits === 0) throw new Error("Break-Even Units cannot be zero when solving for price/cost.");
                        return { varCostPerUnit: salesPricePerUnit - (fixedCosts / breakEvenUnits) };
                    }
                    return null;
                }
            },
             {
                id: "price_volume_profit_increase",
                name: "Price-Volume-Profit (% Volume Increase Needed)",
                description: "Required % Volume Increase = (Old Contrib./unit - New Contrib./unit) / New Contrib./unit (Simplified for unit volume of 1)",
                longDescription: "Calculates the percentage increase in sales volume needed to maintain the same total contribution after a price change. Assumes original volume was effectively 1 for unit contribution comparison or relies on total contribution values. General case: % Vol Incr. = (Lost Total Contribution due to price change) / (New Total Contribution at original volume)",
                variables: [
                    { id: "requiredVolumeIncrease", label: "Required % Volume Increase (%)", placeholder: "e.g., 25", isPercentageOutput: true },
                    { id: "oldContribPerUnit", label: "Old Contribution per unit ($)", placeholder: "e.g., 20" },
                    { id: "newContribPerUnit", label: "New Contribution per unit ($)", placeholder: "e.g., 15" },
                ],
                calculate: (values) => {
                    const { requiredVolumeIncrease, oldContribPerUnit, newContribPerUnit } = values;

                    if (requiredVolumeIncrease === null && oldContribPerUnit !== null && newContribPerUnit !== null) {
                        if (newContribPerUnit <= 0) throw new Error("New Contribution per unit must be positive.");
                        return { requiredVolumeIncrease: ((oldContribPerUnit - newContribPerUnit) / newContribPerUnit) * 100 };
                    }
                    // Solving for oldContribPerUnit or newContribPerUnit
                    if (oldContribPerUnit === null && requiredVolumeIncrease !== null && newContribPerUnit !== null) {
                         if (newContribPerUnit <= 0) throw new Error("New Contribution per unit must be positive.");
                        return { oldContribPerUnit: newContribPerUnit * (1 + requiredVolumeIncrease / 100) };
                    }
                    if (newContribPerUnit === null && requiredVolumeIncrease !== null && oldContribPerUnit !== null) {
                        const denominator = 1 + requiredVolumeIncrease / 100;
                        if (denominator === 0) throw new Error("Required volume increase implies new contribution would be zero or negative based on old.");
                        return { newContribPerUnit: oldContribPerUnit / denominator };
                    }
                    return null;
                }
            }
        ],
        "Cost Allocation & Asset Valuation": [
            {
                id: "full_cost_traceability",
                name: "Full Cost (Traceability)",
                description: "Full Cost = Direct Costs + Indirect Costs",
                variables: [
                    { id: "fullCost", label: "Full Cost ($)", placeholder: "e.g., 15000" },
                    { id: "directCosts", label: "Direct Costs ($)", placeholder: "e.g., 10000" },
                    { id: "indirectCosts", label: "Indirect Costs ($)", placeholder: "e.g., 5000" }
                ],
                calculate: (values) => {
                    const { fullCost, directCosts, indirectCosts } = values;
                    if (fullCost === null && directCosts !== null && indirectCosts !== null) {
                        return { fullCost: directCosts + indirectCosts };
                    }
                    if (directCosts === null && fullCost !== null && indirectCosts !== null) {
                        return { directCosts: fullCost - indirectCosts };
                    }
                    if (indirectCosts === null && fullCost !== null && directCosts !== null) {
                        return { indirectCosts: fullCost - directCosts };
                    }
                    return null;
                }
            },
            {
                id: "allocated_indirect_costs",
                name: "Allocated Indirect Costs to Product",
                description: "Allocated Costs = Total Indirect Costs × (Product's Direct Costs / Total Direct Costs for all products)",
                variables: [
                    { id: "allocatedIndirectCosts", label: "Allocated Indirect Costs to Product ($)", placeholder: "e.g., 500" },
                    { id: "totalIndirectCosts", label: "Total Indirect Costs ($)", placeholder: "e.g., 5000" },
                    { id: "productDirectCosts", label: "Product's Direct Costs ($)", placeholder: "e.g., 1000" },
                    { id: "totalAllDirectCosts", label: "Total Direct Costs (all products) ($)", placeholder: "e.g., 10000" }
                ],
                calculate: (values) => {
                    const { allocatedIndirectCosts, totalIndirectCosts, productDirectCosts, totalAllDirectCosts } = values;

                    if (allocatedIndirectCosts === null && totalIndirectCosts !== null && productDirectCosts !== null && totalAllDirectCosts !== null) {
                        if (totalAllDirectCosts === 0) throw new Error("Total Direct Costs for all products cannot be zero.");
                        return { allocatedIndirectCosts: totalIndirectCosts * (productDirectCosts / totalAllDirectCosts) };
                    }
                    if (totalIndirectCosts === null && allocatedIndirectCosts !== null && productDirectCosts !== null && totalAllDirectCosts !== null) {
                        const ratio = productDirectCosts / totalAllDirectCosts;
                        if (ratio === 0 && allocatedIndirectCosts !== 0) throw new Error("Product direct cost ratio is zero, cannot allocate non-zero costs.");
                        if (ratio === 0 && allocatedIndirectCosts === 0) return { totalIndirectCosts: 0 }; // Or undefined, depends on desired behavior for 0/0
                        if (totalAllDirectCosts === 0 || productDirectCosts === 0 && allocatedIndirectCosts !== 0) throw new Error("Division by zero or inconsistent data.");
                        return { totalIndirectCosts: allocatedIndirectCosts / (productDirectCosts / totalAllDirectCosts) };
                    }
                    if (productDirectCosts === null && allocatedIndirectCosts !== null && totalIndirectCosts !== null && totalAllDirectCosts !== null) {
                        if (totalIndirectCosts === 0 && allocatedIndirectCosts !== 0) throw new Error("Total indirect costs are zero, cannot allocate non-zero costs to product.");
                        if (totalIndirectCosts === 0 && allocatedIndirectCosts === 0) return { productDirectCosts: 0 };
                        return { productDirectCosts: (allocatedIndirectCosts / totalIndirectCosts) * totalAllDirectCosts };
                    }
                    if (totalAllDirectCosts === null && allocatedIndirectCosts !== null && totalIndirectCosts !== null && productDirectCosts !== null) {
                        if (totalIndirectCosts === 0 && productDirectCosts === 0 && allocatedIndirectCosts === 0) return { totalAllDirectCosts: 0 }; // Or undefined
                        if (totalIndirectCosts === 0 && productDirectCosts !==0 && allocatedIndirectCosts === 0) return { totalAllDirectCosts: 0}; // Any non-zero total direct cost would work if product direct cost is non-zero. This is indeterminate.
                        if (allocatedIndirectCosts === 0 && totalIndirectCosts === 0) return { totalAllDirectCosts: productDirectCosts }; // Could be any value >= productDirectCosts. Simplest is equality.

                        const numerator = totalIndirectCosts * productDirectCosts;
                        if (allocatedIndirectCosts === 0 && numerator !== 0) throw new Error("Cannot solve for Total Direct Costs if allocated amount is zero but inputs suggest otherwise.");
                        if (allocatedIndirectCosts === 0 && numerator === 0) return { totalAllDirectCosts: productDirectCosts }; // if productDirectCosts is also 0. Indeterminate if productDirectCosts > 0. Let's assume it must be at least productDirectCosts.

                        if (allocatedIndirectCosts === 0) throw new Error ("Cannot solve for Total Direct Costs when allocated amount is zero (unless other cost components are also zero, making it indeterminate).");
                        return { totalAllDirectCosts: (totalIndirectCosts * productDirectCosts) / allocatedIndirectCosts };
                    }
                    return null;
                }
            },
            {
                id: "straight_line_depreciation",
                name: "Straight-Line Depreciation",
                description: "Depreciation = (Asset Cost – Salvage Value) / Useful Life",
                variables: [
                    { id: "depreciation", label: "Annual Depreciation ($)", placeholder: "e.g., 1800" },
                    { id: "assetCost", label: "Asset Cost ($)", placeholder: "e.g., 10000" },
                    { id: "salvageValue", label: "Salvage Value ($)", placeholder: "e.g., 1000" },
                    { id: "usefulLife", label: "Useful Life (years)", placeholder: "e.g., 5" }
                ],
                calculate: (values) => {
                    const { depreciation, assetCost, salvageValue, usefulLife } = values;
                    if (depreciation === null && assetCost !== null && salvageValue !== null && usefulLife !== null) {
                        if (usefulLife === 0) throw new Error("Useful Life cannot be zero.");
                        return { depreciation: (assetCost - salvageValue) / usefulLife };
                    }
                    if (assetCost === null && depreciation !== null && salvageValue !== null && usefulLife !== null) {
                        return { assetCost: (depreciation * usefulLife) + salvageValue };
                    }
                    if (salvageValue === null && depreciation !== null && assetCost !== null && usefulLife !== null) {
                        return { salvageValue: assetCost - (depreciation * usefulLife) };
                    }
                    if (usefulLife === null && depreciation !== null && assetCost !== null && salvageValue !== null) {
                        const netBookValue = assetCost - salvageValue;
                        if (depreciation === 0 && netBookValue !== 0) throw new Error ("Depreciation cannot be zero if asset cost > salvage value.");
                        if (depreciation === 0 && netBookValue === 0) return { usefulLife: 0 }; // Or indicate N/A as life is indeterminate
                        return { usefulLife: netBookValue / depreciation };
                    }
                    return null;
                }
            },
            {
                id: "asset_cost_per_product",
                name: "Asset Cost per Product (Depr. + Financing)",
                description: "Cost/Product = (Ann. Depr. / Ann. Prod. Vol.) + ((Asset Value × COIC %) / Ann. Prod. Vol.)",
                variables: [
                    { id: "assetCostPerProduct", label: "Asset Cost per Product ($)", placeholder: "e.g., 2.50" },
                    { id: "totalAnnualDepreciation", label: "Total Annual Depreciation ($)", placeholder: "e.g., 1800" },
                    { id: "annualProductionVolume", label: "Annual Production Volume (units)", placeholder: "e.g., 10000" },
                    { id: "assetValue", label: "Asset Value (for COIC calc) ($)", placeholder: "e.g., 9000 (e.g. avg book value)" },
                    { id: "coic", label: "COIC (%)", placeholder: "e.g., 8", isPercentageInput: true }
                ],
                calculate: (values) => {
                    const { assetCostPerProduct, totalAnnualDepreciation, annualProductionVolume, assetValue, coic } = values;
                    const coicDecimal = coic !== null ? coic / 100 : null;

                    if (assetCostPerProduct === null && totalAnnualDepreciation !== null && annualProductionVolume !== null && assetValue !== null && coicDecimal !== null) {
                        if (annualProductionVolume === 0) throw new Error("Annual Production Volume cannot be zero.");
                        const deprPerUnit = totalAnnualDepreciation / annualProductionVolume;
                        const financingPerUnit = (assetValue * coicDecimal) / annualProductionVolume;
                        return { assetCostPerProduct: deprPerUnit + financingPerUnit };
                    }
                    // Solving for other variables can become complex due to the structure.
                    // Example: Solving for totalAnnualDepreciation
                    if (totalAnnualDepreciation === null && assetCostPerProduct !== null && annualProductionVolume !== null && assetValue !== null && coicDecimal !== null) {
                        if (annualProductionVolume === 0) throw new Error("Annual Production Volume cannot be zero.");
                        const financingCost = assetValue * coicDecimal;
                        return { totalAnnualDepreciation: (assetCostPerProduct * annualProductionVolume) - financingCost };
                    }
                     // Example: Solving for annualProductionVolume
                    if (annualProductionVolume === null && assetCostPerProduct !== null && totalAnnualDepreciation !== null && assetValue !== null && coicDecimal !== null) {
                        if (assetCostPerProduct <= 0 && (totalAnnualDepreciation + assetValue * coicDecimal) > 0) throw new Error("Asset cost per product must be positive if total costs are positive.");
                        if (assetCostPerProduct === 0 && (totalAnnualDepreciation + assetValue * coicDecimal) === 0) return {annualProductionVolume: 0} // Or undefined.
                        if (assetCostPerProduct === 0 ) throw new Error("Asset cost per product cannot be zero if costs exist.");
                        return { annualProductionVolume: (totalAnnualDepreciation + (assetValue * coicDecimal)) / assetCostPerProduct };
                    }
                    // Add more solvers if feasible and not overly complex
                    return null; // Indicate calculation not possible for the blank field or insufficient inputs
                }
            }
        ],
        "Internal Pricing (Conceptual - Decision Helper)": [
            {
                id: "optimal_internal_transfer_price",
                name: "Optimal Internal Transfer Price",
                description: "Helps determine the internal transfer price based on capacity.",
                variables: [ // These are more like inputs for scenarios
                    { id: "scenario", label: "Scenario", type: "select", options: [{value: "no_capacity", text: "No Available Capacity"}, {value: "has_capacity", text: "Has Available Capacity"}]},
                    { id: "marketPriceSupplierExternal", label: "Market Price (Supplier's External) ($)", placeholder: "e.g., 100", forScenario: "no_capacity"},
                    { id: "supplierVariableCost", label: "Supplier's Variable Cost ($)", placeholder: "e.g., 60", forScenario: "has_capacity"},
                    { id: "buyerExternalPurchasePrice", label: "Buyer's External Purchase Price ($)", placeholder: "e.g., 95", forScenario: "has_capacity"}
                ],
                isDecisionHelper: true, // Custom flag
                calculate: (values) => { // This won't solve for a missing variable in the typical sense
                    const { scenario, marketPriceSupplierExternal, supplierVariableCost, buyerExternalPurchasePrice } = values;
                    let outputHtml = "";

                    if (scenario === "no_capacity") {
                        if (marketPriceSupplierExternal !== null) {
                            outputHtml = `<p><strong>Optimal Internal Transfer Price:</strong> $${formatNumber(marketPriceSupplierExternal)}</p><p>(Equal to Market Price as there's no available capacity)</p>`;
                        } else {
                            outputHtml = "<p>Please enter the Market Price (Supplier's External).</p>";
                        }
                    } else if (scenario === "has_capacity") {
                        if (supplierVariableCost !== null && buyerExternalPurchasePrice !== null) {
                            if (supplierVariableCost > buyerExternalPurchasePrice) {
                                outputHtml = `<p><strong>Warning:</strong> Supplier's Variable Cost ($${formatNumber(supplierVariableCost)}) is greater than Buyer's External Purchase Price ($${formatNumber(buyerExternalPurchasePrice)}). Internal transfer may not be beneficial under these terms.</p>`;
                            }
                            outputHtml += `<p><strong>Optimal Internal Transfer Price Range:</strong> [$${formatNumber(supplierVariableCost)}, $${formatNumber(buyerExternalPurchasePrice)}]</p>`;
                            outputHtml += `<p>(Between Supplier's Variable Cost and Buyer's External Purchase Price)</p>`;
                        } else {
                             outputHtml = "<p>Please enter Supplier's Variable Cost and Buyer's External Purchase Price.</p>";
                        }
                    }
                    formula22OutputArea.innerHTML = outputHtml;
                    formula22OutputArea.style.display = outputHtml ? 'block' : 'none';
                    return {}; // No single field to return for calculation
                }
            }
        ],
        "Specific Project/Decision Evaluation": [
            {
                id: "incremental_ep",
                name: "Incremental Economic Profit (EP)",
                description: "Incremental EP = Incremental Operating Profit – (Incremental Invested Capital × COIC %)",
                variables: [
                    { id: "incrementalEp", label: "Incremental Economic Profit ($)", placeholder: "e.g., 5000" },
                    { id: "incrementalOpProfit", label: "Incremental Operating Profit ($)", placeholder: "e.g., 10000" },
                    { id: "incrementalIc", label: "Incremental Invested Capital ($)", placeholder: "e.g., 50000" },
                    { id: "coic", label: "COIC (%)", placeholder: "e.g., 10", isPercentageInput: true }
                ],
                calculate: (values) => { // Similar to EP from IC & COIC
                    const { incrementalEp, incrementalOpProfit, incrementalIc, coic } = values;
                    const coicDecimal = coic !== null ? coic / 100 : null;

                    if (incrementalEp === null && incrementalOpProfit !== null && incrementalIc !== null && coicDecimal !== null) {
                        return { incrementalEp: incrementalOpProfit - (incrementalIc * coicDecimal) };
                    }
                    if (incrementalOpProfit === null && incrementalEp !== null && incrementalIc !== null && coicDecimal !== null) {
                        return { incrementalOpProfit: incrementalEp + (incrementalIc * coicDecimal) };
                    }
                    if (incrementalIc === null && incrementalEp !== null && incrementalOpProfit !== null && coicDecimal !== null) {
                        if (coicDecimal === 0) throw new Error("COIC cannot be zero if solving for Incremental Invested Capital.");
                        return { incrementalIc: (incrementalOpProfit - incrementalEp) / coicDecimal };
                    }
                    if (coic === null && incrementalEp !== null && incrementalOpProfit !== null && incrementalIc !== null) {
                        if (incrementalIc === 0) throw new Error("Incremental Invested Capital cannot be zero if solving for COIC.");
                        return { coic: ((incrementalOpProfit - incrementalEp) / incrementalIc) * 100 };
                    }
                    return null;
                }
            },
            {
                id: "financing_cost_delayed_payment",
                name: "Financing Cost of Delayed Payment",
                description: "Cost = Amount Receivable × COIC % × (Delay Period in months / 12)",
                variables: [
                    { id: "financingCostDelayed", label: "Financing Cost of Delay ($)", placeholder: "e.g., 83.33" },
                    { id: "amountReceivable", label: "Amount of Receivable ($)", placeholder: "e.g., 10000" },
                    { id: "coic", label: "COIC (%)", placeholder: "e.g., 10", isPercentageInput: true },
                    { id: "delayPeriodMonths", label: "Delay Period (months)", placeholder: "e.g., 1" }
                ],
                calculate: (values) => {
                    const { financingCostDelayed, amountReceivable, coic, delayPeriodMonths } = values;
                    const coicDecimal = coic !== null ? coic / 100 : null;
                    const delayFractionOfYear = delayPeriodMonths !== null ? delayPeriodMonths / 12 : null;

                    if (financingCostDelayed === null && amountReceivable !== null && coicDecimal !== null && delayFractionOfYear !== null) {
                        return { financingCostDelayed: amountReceivable * coicDecimal * delayFractionOfYear };
                    }
                    if (amountReceivable === null && financingCostDelayed !== null && coicDecimal !== null && delayFractionOfYear !== null) {
                        const denominator = coicDecimal * delayFractionOfYear;
                        if (denominator === 0) throw new Error("COIC or Delay Period cannot be zero if solving for Amount Receivable (unless cost is also 0).");
                        return { amountReceivable: financingCostDelayed / denominator };
                    }
                    if (coic === null && financingCostDelayed !== null && amountReceivable !== null && delayFractionOfYear !== null) {
                        const denominator = amountReceivable * delayFractionOfYear;
                        if (denominator === 0) throw new Error("Amount Receivable or Delay Period cannot be zero if solving for COIC (unless cost is also 0).");
                        return { coic: (financingCostDelayed / denominator) * 100 };
                    }
                    if (delayPeriodMonths === null && financingCostDelayed !== null && amountReceivable !== null && coicDecimal !== null) {
                        const denominator = amountReceivable * coicDecimal / 12; // Keep /12 for months
                        if (denominator === 0) throw new Error("Amount Receivable or COIC cannot be zero if solving for Delay Period (unless cost is also 0).");
                        return { delayPeriodMonths: financingCostDelayed / (amountReceivable * coicDecimal / 12) };
                    }
                    return null;
                }
            }
        ]
    };

    function populateFormulaList() {
        for (const category in formulas) {
            const categoryH3 = document.createElement('h3');
            categoryH3.textContent = category;
            formulaListNav.appendChild(categoryH3);

            const ul = document.createElement('ul');
            formulas[category].forEach(formula => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = `#${formula.id}`;
                a.textContent = formula.name;
                a.dataset.formulaId = formula.id;
                a.dataset.category = category;
                li.appendChild(a);
                ul.appendChild(li);
            });
            formulaListNav.appendChild(ul);
        }
    }

    function displayFormula(formulaId, category) {
        activeFormula = formulas[category].find(f => f.id === formulaId);
        if (!activeFormula) return;

        // Update titles
        formulaTitle.textContent = activeFormula.name;
        formulaDescription.textContent = activeFormula.longDescription || activeFormula.description;


        // Clear previous form
        calculatorForm.innerHTML = '';
        resultArea.innerHTML = '';
        resultArea.classList.add('hidden');
        clearErrorMessage();
        formula22OutputArea.style.display = 'none'; // Hide special output area by default


        activeFormulaInputs = []; // Reset active inputs

        // Generate new form fields
        activeFormula.variables.forEach(variable => {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'input-group';

            const label = document.createElement('label');
            label.setAttribute('for', variable.id);
            label.textContent = variable.label;

            if (variable.tooltip || (activeFormula.id === 'price_volume_profit_increase' && variable.id === 'requiredVolumeIncrease')) {
                const tooltipTrigger = document.createElement('span');
                tooltipTrigger.className = 'tooltip-trigger';
                tooltipTrigger.textContent = ' \u24D8'; // Circled i
                tooltipTrigger.setAttribute('tabindex', '0'); // Make it focusable for accessibility

                const tooltipText = document.createElement('span');
                tooltipText.className = 'tooltip-text';
                if (activeFormula.id === 'price_volume_profit_increase' && variable.id === 'requiredVolumeIncrease') {
                     tooltipText.textContent = activeFormula.longDescription || "Percentage increase in sales volume needed to maintain total contribution after a unit contribution change.";
                } else {
                    tooltipText.textContent = variable.tooltip;
                }
                label.appendChild(tooltipTrigger);
                label.appendChild(tooltipText);

            }


            inputGroup.appendChild(label);

            if (variable.type === 'select') {
                const select = document.createElement('select');
                select.id = variable.id;
                select.name = variable.id;
                variable.options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt.value;
                    option.textContent = opt.text;
                    select.appendChild(option);
                });
                inputGroup.appendChild(select);
                activeFormulaInputs.push(select);
                select.addEventListener('change', () => {
                     if (activeFormula.isDecisionHelper) { // Special handling for formula 22
                        activeFormula.calculate(getFormValues());
                    } else {
                        attemptCalculation();
                    }
                    // Toggle visibility of fields for formula 22 based on scenario
                    if (activeFormula.id === 'optimal_internal_transfer_price') {
                        toggleFormula22Fields(select.value);
                    }
                });
                if (activeFormula.id === 'optimal_internal_transfer_price') {
                    // Initial toggle based on default selection
                     setTimeout(() => toggleFormula22Fields(select.value), 0);
                }

            } else {
                const input = document.createElement('input');
                input.type = 'number';
                input.id = variable.id;
                input.name = variable.id;
                input.placeholder = variable.placeholder || '';
                if (variable.isPercentageInput || variable.isPercentageOutput) {
                    // input.step = "0.01"; // Allow decimals for percentages
                } else {
                    // input.step = "0.01"; // For currency, etc.
                }
                input.step = "any"; // General purpose step

                inputGroup.appendChild(input);
                activeFormulaInputs.push(input);

                input.addEventListener('input', () => {
                    input.classList.remove('is-calculated'); // User is typing, not calculated
                    input.classList.remove('is-error-highlight');
                    clearErrorMessage();
                    if (activeFormula.isDecisionHelper) { // Special handling for formula 22
                        activeFormula.calculate(getFormValues());
                    } else {
                        attemptCalculation();
                    }
                });
                 input.addEventListener('focus', () => {
                    // When a field gets focus, if it was previously calculated, clear it
                    // to signal the user is now providing this input.
                    // This is a bit aggressive, an alternative is a small 'x' icon.
                    // For now, let's highlight it as the target instead.
                    activeFormulaInputs.forEach(inp => inp.classList.remove('solve-target-highlight')); // hypothetical class
                    // If it's not empty, user intends to edit. If it's empty, it's a solve target.
                    if(input.value === ''){
                       // input.classList.add('solve-target-highlight');
                    }
                });

            }
            calculatorForm.appendChild(inputGroup);
        });

        // Highlight previously selected formula
        document.querySelectorAll('#formula-list-nav a').forEach(a => a.classList.remove('active'));
        const activeLink = document.querySelector(`#formula-list-nav a[data-formula-id="${formulaId}"]`);
        if (activeLink) activeLink.classList.add('active');
    }

    function toggleFormula22Fields(scenario) {
        const marketPriceField = document.getElementById('marketPriceSupplierExternal');
        const supplierCostField = document.getElementById('supplierVariableCost');
        const buyerPriceField = document.getElementById('buyerExternalPurchasePrice');

        if (marketPriceField) marketPriceField.closest('.input-group').style.display = (scenario === 'no_capacity') ? 'block' : 'none';
        if (supplierCostField) supplierCostField.closest('.input-group').style.display = (scenario === 'has_capacity') ? 'block' : 'none';
        if (buyerPriceField) buyerPriceField.closest('.input-group').style.display = (scenario === 'has_capacity') ? 'block' : 'none';
    }


    function getFormValues() {
        const values = {};
        let emptyCount = 0;
        let firstEmptyField = null;

        activeFormulaInputs.forEach(input => {
            let value = input.value;
            if (input.type === 'number') {
                value = value.trim() === '' ? null : parseFloat(value);
                if (value === null) {
                    emptyCount++;
                    if (!firstEmptyField) firstEmptyField = input;
                } else if (isNaN(value)) {
                    throw new Error(`Invalid number entered in "${input.labels[0].textContent}".`);
                }
            } else if (input.type === 'select-one') { // For select elements
                values[input.id] = input.value; // Store the string value
                return; // Skip empty count for selects as they always have a value
            }


            // For formula 22, we need to handle field visibility
            if (activeFormula.id === 'optimal_internal_transfer_price') {
                const scenarioSelect = document.getElementById('scenario');
                if (scenarioSelect) {
                    const currentScenario = scenarioSelect.value;
                    const fieldScenario = activeFormula.variables.find(v => v.id === input.id)?.forScenario;
                    if (fieldScenario && fieldScenario !== currentScenario) {
                        values[input.id] = null; // effectively ignore this field if not for current scenario
                        return; // don't count as empty or process further if not for this scenario
                    }
                }
            }
            values[input.id] = value;
        });
        return { values, emptyCount, firstEmptyField };
    }

    function attemptCalculation() {
        if (!activeFormula || activeFormula.isDecisionHelper) { // Decision helpers have custom output
             if (activeFormula && activeFormula.isDecisionHelper) {
                try {
                    const { values } = getFormValues();
                    activeFormula.calculate(values); // This will update formula22OutputArea
                    clearErrorMessage();
                } catch (e) {
                    displayError(e.message);
                }
            }
            return;
        }
        clearErrorMessage();
        resultArea.innerHTML = ''; // Clear previous results
        resultArea.classList.add('hidden');
        activeFormulaInputs.forEach(input => {
            input.classList.remove('is-calculated');
            input.classList.remove('is-error-highlight');
        });


        try {
            const { values, emptyCount, firstEmptyField } = getFormValues();

            if (emptyCount > 1) {
                displayError("Please fill all but one field to calculate.");
                return;
            }
            if (emptyCount === 0 && activeFormulaInputs.length > 1) { // If all are filled, assume last one was target or user wants to re-calc with no explicit blank
                // This case needs refinement: which one to solve for if all are full?
                // For now, let's require one blank unless it's a single-input-like formula (none in this set)
                // Or, we can try to calculate for the first field if all are full as a default.
                // For now, let's assume the user clears one field to indicate what to solve for.
                // displayError("Please leave one field blank to calculate its value or clear a field.");
                // Let's try to re-calculate for the first field if all are full (as a implicit target)
                // This is a design choice. The prompt suggests "leave one blank".
                // If we don't do this, the user might be confused if they fill all and nothing happens.

                // To make it more intuitive, if all are filled, we don't calculate unless a button is pressed.
                // Since calculation is real-time, this state means the last typed field triggered it.
                // The "leave one blank" is the primary UX.
                // So, if emptyCount is 0, it means the user just filled the last field.
                // The previous state had one empty field, which was calculated.
                // Let's just proceed, the calculation logic will see no nulls and might not return a value.
            }


            const result = activeFormula.calculate(values);

            if (result) {
                let resultDisplayed = false;
                for (const key in result) {
                    const inputField = document.getElementById(key);
                    if (inputField) {
                        const variableDefinition = activeFormula.variables.find(v => v.id === key);
                        let displayValue = result[key];

                        // Handle rounding for percentages and currency-like values
                        if (typeof displayValue === 'number') {
                            if (variableDefinition?.isPercentageOutput) {
                                displayValue = parseFloat(displayValue.toFixed(2)); // Percentages often to 2dp
                            } else if (key.toLowerCase().includes("cost") || key.toLowerCase().includes("price") || key.toLowerCase().includes("revenue") || key.toLowerCase().includes("profit") || key.toLowerCase().includes("value") || key.toLowerCase().includes("capital")) {
                                displayValue = parseFloat(displayValue.toFixed(2)); // Currency typically 2dp
                            } else {
                                displayValue = parseFloat(displayValue.toFixed(4)); // Factors or other numbers
                            }
                        }

                        inputField.value = displayValue;
                        inputField.classList.add('is-calculated');
                        // Also display in the main result area if it was the blank field
                        if (firstEmptyField && firstEmptyField.id === key) {
                            resultArea.innerHTML = `Calculated ${inputField.labels[0].textContent.replace(':','').trim()}: <strong>${displayValue}${variableDefinition?.isPercentageOutput ? '%' : ''}</strong>`;
                            resultArea.classList.remove('hidden');
                            resultDisplayed = true;
                        }
                    }
                }
                if (!resultDisplayed && emptyCount === 0 && activeFormulaInputs.length > 0) {
                    // If all fields were full and a calculation was possible (e.g. for a check)
                    // and if the formula is simple enough that it could update one field based on others.
                    // This part is tricky. The prompt expects solving for *the* blank.
                    // If no field was blank, we might display a general "Verified" or the result of the first var.
                    // For now, we rely on the `firstEmptyField` logic. If it's null, it means all were filled.
                    // In this case, `activeFormula.calculate` was called, but we might not update a specific field as "calculated".
                    // This path implies all fields were filled by the user.
                    // We could pick the *first* variable of the formula to display in the result area.
                    const firstVarId = activeFormula.variables[0].id;
                    if (result[firstVarId] !== undefined) {
                         const variableDefinition = activeFormula.variables.find(v => v.id === firstVarId);
                         let displayValue = result[firstVarId];
                         if (typeof displayValue === 'number') {
                            if (variableDefinition?.isPercentageOutput) {
                                displayValue = parseFloat(displayValue.toFixed(2));
                            } else {
                                displayValue = parseFloat(displayValue.toFixed(2)); // Default to 2dp for general display
                            }
                        }
                        resultArea.innerHTML = `Result for ${activeFormula.variables[0].label.replace(':','').trim()}: <strong>${displayValue}${variableDefinition?.isPercentageOutput ? '%' : ''}</strong> (assuming all inputs provided)`;
                        resultArea.classList.remove('hidden');
                    }
                }


            } else if (emptyCount === 1) {
                displayError(`Could not calculate ${firstEmptyField.labels[0].textContent}. Ensure other fields are valid or the formula can be rearranged for this variable.`);
                firstEmptyField.classList.add('is-error-highlight');
            } else if (emptyCount === 0 && Object.keys(values).length === activeFormulaInputs.length) {
                // All fields filled, no specific target. Maybe show a "Ready" or "Inputs Valid" message, or nothing.
                // If a result object was returned, it means the formula validated the inputs.
                // If `result` is null here, it means the calculate function couldn't make sense of all inputs.
                // This case is already handled by the previous `if (result)` block.
            }


        } catch (e) {
            displayError(e.message);
            // Try to highlight the field if the error message implies a specific one.
            const formVals = getFormValues(); // Re-get to see if any input is NaN after parseFloat
            activeFormulaInputs.forEach(input => {
                if (input.type === 'number' && isNaN(parseFloat(input.value)) && input.value.trim() !== '') {
                    input.classList.add('is-error-highlight');
                }
                if (e.message.toLowerCase().includes(input.id.toLowerCase()) || e.message.toLowerCase().includes(input.labels[0].textContent.toLowerCase().replace(':','').trim())) {
                     input.classList.add('is-error-highlight');
                }

            });
        }
    }

    function displayError(message) {
        errorMessageArea.textContent = message;
        errorMessageArea.classList.remove('hidden');
        errorMessageArea.style.display = 'block'; // Ensure visible
    }

    function clearErrorMessage() {
        errorMessageArea.textContent = '';
        errorMessageArea.classList.add('hidden');
        errorMessageArea.style.display = 'none'; // Ensure hidden
        activeFormulaInputs.forEach(input => input.classList.remove('is-error-highlight'));
    }

    function clearFields() {
        activeFormulaInputs.forEach(input => {
            if (input.type === 'number' || input.type === 'text') {
                input.value = '';
            } else if (input.type === 'select-one') {
                input.selectedIndex = 0; // Reset select to first option
                if (activeFormula && activeFormula.id === 'optimal_internal_transfer_price') {
                    toggleFormula22Fields(input.value); // Update field visibility based on reset value
                }
            }
            input.classList.remove('is-calculated', 'is-error-highlight');
        });
        resultArea.innerHTML = '';
        resultArea.classList.add('hidden');
        clearErrorMessage();
        formula22OutputArea.innerHTML = '';
        formula22OutputArea.style.display = 'none';

        // If it's the decision helper, re-run its logic with cleared/default inputs
        if (activeFormula && activeFormula.isDecisionHelper) {
            activeFormula.calculate(getFormValues().values);
        }

        // Set focus to the first input field if available
        if (activeFormulaInputs.length > 0) {
            activeFormulaInputs[0].focus();
        }
    }

    function formatNumber(num, decimals = 2) {
        if (num === null || num === undefined || isNaN(num)) return 'N/A';
        return Number(num).toFixed(decimals);
    }


    // Event Listeners
    formulaListNav.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.tagName === 'A') {
            const formulaId = e.target.dataset.formulaId;
            const category = e.target.dataset.category;
            if (formulaId && category) {
                displayFormula(formulaId, category);
                clearFields(); // Clear fields when a new formula is selected
            }
        }
    });

    clearButton.addEventListener('click', clearFields);

    formulaSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('#formula-list-nav ul li').forEach(li => {
            const formulaName = li.textContent.toLowerCase();
            const categoryName = li.closest('ul').previousElementSibling.textContent.toLowerCase();
            if (formulaName.includes(searchTerm) || categoryName.includes(searchTerm)) {
                li.style.display = '';
            } else {
                li.style.display = 'none';
            }
        });
         // Also hide/show category headers if all items within are hidden
        document.querySelectorAll('#formula-list-nav h3').forEach(h3 => {
            const ul = h3.nextElementSibling;
            if (ul && ul.tagName === 'UL') {
                const visibleItems = Array.from(ul.querySelectorAll('li')).some(li => li.style.display !== 'none');
                h3.style.display = visibleItems ? '' : 'none';
            }
        });
    });


    // Initialization
    populateFormulaList();
    // Optionally, display the first formula by default or a welcome message
    if (Object.keys(formulas).length > 0 && formulas[Object.keys(formulas)[0]].length > 0) {
        const firstCategory = Object.keys(formulas)[0];
        const firstFormula = formulas[firstCategory][0];
        displayFormula(firstFormula.id, firstCategory);
    } else {
        formulaTitle.textContent = "Welcome";
        formulaDescription.textContent = "Please select a formula from the list on the left.";
    }

});
