import { Individual, LineItem } from '../services/firebaseSetup';

/**
 * Calculate proportional tax share based on subtotal percentage
 */
export function calculateTaxShare(
  individualSubtotal: number,
  totalSubtotal: number,
  totalTax: number
): number {
  if (totalSubtotal === 0) return 0;
  const proportion = individualSubtotal / totalSubtotal;
  return roundToTwoDecimals(totalTax * proportion);
}

/**
 * Calculate proportional tip share based on subtotal percentage
 */
export function calculateTipShare(
  individualSubtotal: number,
  totalSubtotal: number,
  tipAmount: number
): number {
  if (totalSubtotal === 0) return 0;
  const proportion = individualSubtotal / totalSubtotal;
  return roundToTwoDecimals(tipAmount * proportion);
}

/**
 * Calculate tip amount from percentage
 */
export function calculateTipFromPercentage(
  subtotal: number,
  tipPercentage: number
): number {
  return roundToTwoDecimals(subtotal * (tipPercentage / 100));
}

/**
 * Round to two decimal places for currency
 */
export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculate total for an individual including their items, tax share, and tip share
 */
export function calculateIndividualTotal(
  items: LineItem[],
  taxShare: number,
  tipShare: number
): number {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return roundToTwoDecimals(subtotal + taxShare + tipShare);
}

/**
 * Calculate subtotal from line items
 */
export function calculateSubtotal(items: LineItem[]): number {
  return roundToTwoDecimals(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
}

/**
 * Split bill evenly among N people
 */
export function splitEvenly(
  total: number,
  numberOfPeople: number,
  names: string[]
): Individual[] {
  if (numberOfPeople === 0) return [];
  
  const perPerson = roundToTwoDecimals(total / numberOfPeople);
  const remainder = roundToTwoDecimals(total - perPerson * numberOfPeople);
  
  return names.map((name, index) => ({
    name,
    items: [],
    subtotal: perPerson,
    taxShare: 0,
    tipShare: 0,
    // Add remainder to first person to ensure exact total
    owed: index === 0 ? perPerson + remainder : perPerson,
  }));
}

/**
 * Validate that split totals match the receipt total
 */
export function validateSplit(
  individuals: Individual[],
  expectedTotal: number,
  tolerance: number = 0.02
): { isValid: boolean; difference: number } {
  const actualTotal = individuals.reduce((sum, ind) => sum + ind.owed, 0);
  const difference = roundToTwoDecimals(Math.abs(actualTotal - expectedTotal));
  return {
    isValid: difference <= tolerance,
    difference,
  };
}

/**
 * Calculate percentage difference between two values
 */
export function calculatePercentageDiff(
  actual: number,
  expected: number
): number {
  if (expected === 0) return 0;
  return roundToTwoDecimals(((actual - expected) / expected) * 100);
}

/**
 * Determine if an item is overpriced based on threshold
 */
export function isOverpriced(
  actualPrice: number,
  averagePrice: number,
  thresholdPercent: number = 20
): boolean {
  const percentDiff = calculatePercentageDiff(actualPrice, averagePrice);
  return percentDiff > thresholdPercent;
}

/**
 * Calculate rip-off score (1-10) based on average overpricing
 */
export function calculateRipOffScore(
  priceComparisons: Array<{ receiptPrice: number; averagePrice: number }>
): number {
  if (priceComparisons.length === 0) return 1;

  const totalPercentDiff = priceComparisons.reduce((sum, item) => {
    const diff = calculatePercentageDiff(item.receiptPrice, item.averagePrice);
    return sum + Math.max(0, diff); // Only count overpricing
  }, 0);

  const averageOverpricing = totalPercentDiff / priceComparisons.length;

  // Scale: 0% = 1, 100%+ = 10
  const score = Math.min(10, Math.max(1, Math.ceil(averageOverpricing / 10) + 1));
  return score;
}

/**
 * Format currency value
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Calculate total overpayment from price comparisons
 */
export function calculateTotalOverpayment(
  priceComparisons: Array<{ receiptPrice: number; averagePrice: number }>
): number {
  return roundToTwoDecimals(
    priceComparisons.reduce((sum, item) => {
      const diff = item.receiptPrice - item.averagePrice;
      return sum + (diff > 0 ? diff : 0);
    }, 0)
  );
}
