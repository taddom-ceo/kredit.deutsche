// Calibrated against a reference German loan-comparison calculator:
// 15.000 € / 72 Monate → 255 €/Monat, and 53.000 € / 72 Monate → 901 €/Monat.
// Both are reproduced exactly by an effective annual rate of 6.90 %.
export const SAMPLE_ANNUAL_RATE = 0.069;

export const AMOUNT_MIN = 1000;
export const AMOUNT_MAX = 100000;
export const AMOUNT_STEP = 500;

export const DURATIONS = [12, 24, 36, 48, 60, 72, 84, 96, 108, 120, 240];

export function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function monthlyPayment(
  principal: number,
  months: number,
  annualRate: number = SAMPLE_ANNUAL_RATE
) {
  const monthlyRate = annualRate / 12;
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}
