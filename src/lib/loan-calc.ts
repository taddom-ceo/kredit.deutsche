// EFFECTIVE annual rate (effektiver Jahreszins), i.e. the figure the UI shows.
// Because it is effective rather than nominal, the monthly rate is derived
// geometrically via monthlyRate() — dividing by 12 would silently turn 2.89 %
// into an effective 2.93 % and make the displayed number wrong.
export const SAMPLE_ANNUAL_RATE = 0.0289;

/**
 * Der teure Vergleichszins, gegen den die Ersparnis gerechnet wird.
 *
 * Er stand bisher nur als Text im Aufmacher ("Ersparnis = Differenz der
 * Gesamtkosten gegenueber 8,50 % eff."), waehrend die genannte Ersparnis von
 * Hand ausgerechnet war. Sobald eine Zahl mitrechnet, muss der Zins dahinter
 * dieselbe Konstante sein wie im Hinweis darunter — sonst behauptet die
 * Plakette etwas, das die Fussnote widerlegt.
 */
export const VERGLEICHS_ANNUAL_RATE = 0.085;

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

// Converts an effective annual rate into the monthly rate that compounds to
// it over twelve months: (1 + i_eff)^(1/12) − 1. This is the conversion the
// German effective-rate definition implies; annualRate / 12 would be the
// nominal (Sollzins) convention and would overstate the cost.
export function monthlyRate(annualRate: number = SAMPLE_ANNUAL_RATE) {
  return Math.pow(1 + annualRate, 1 / 12) - 1;
}

export function monthlyPayment(
  principal: number,
  months: number,
  annualRate: number = SAMPLE_ANNUAL_RATE
) {
  const i = monthlyRate(annualRate);
  if (i === 0) return principal / months;
  const factor = Math.pow(1 + i, months);
  return (principal * i * factor) / (factor - 1);
}

// Inverse of monthlyPayment: which loan amount produces a given monthly rate?
// Solving P = A·i·f/(f−1) for A gives A = P·(f−1)/(i·f).
export function principalFromPayment(
  payment: number,
  months: number,
  annualRate: number = SAMPLE_ANNUAL_RATE
) {
  const i = monthlyRate(annualRate);
  if (i === 0) return payment * months;
  const factor = Math.pow(1 + i, months);
  return (payment * (factor - 1)) / (i * factor);
}

// A freely typed amount has to land on the same grid the slider moves on,
// and inside its range, so slider and readout can never disagree.
export function clampAmount(value: number) {
  const snapped = Math.round(value / AMOUNT_STEP) * AMOUNT_STEP;
  return Math.min(AMOUNT_MAX, Math.max(AMOUNT_MIN, snapped));
}
