// Calibrated against a reference German loan-comparison calculator:
// 15.000 € / 72 Monate → 255 €/Monat, and 53.000 € / 72 Monate → 901 €/Monat.
//
// This is a NOMINAL annual rate (Sollzins): monthlyPayment divides it by 12
// rather than converting geometrically, which is what reproduces those two
// reference figures. The corresponding effective annual rate (effektiver
// Jahreszins) is higher — (1 + 0.069/12)^12 − 1 ≈ 7.12 % — so this constant
// must never be labelled as an effective rate in the UI.
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

// Inverse of monthlyPayment: which loan amount produces a given monthly rate?
// Solving P = A·r·f/(f−1) for A gives A = P·(f−1)/(r·f).
export function principalFromPayment(
  payment: number,
  months: number,
  annualRate: number = SAMPLE_ANNUAL_RATE
) {
  const monthlyRate = annualRate / 12;
  if (monthlyRate === 0) return payment * months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (payment * (factor - 1)) / (monthlyRate * factor);
}

// A freely typed amount has to land on the same grid the slider moves on,
// and inside its range, so slider and readout can never disagree.
export function clampAmount(value: number) {
  const snapped = Math.round(value / AMOUNT_STEP) * AMOUNT_STEP;
  return Math.min(AMOUNT_MAX, Math.max(AMOUNT_MIN, snapped));
}
