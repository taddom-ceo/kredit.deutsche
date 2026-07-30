export function isValidIban(rawIban: string): boolean {
  const iban = rawIban.replace(/\s+/g, "").toUpperCase();

  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$/.test(iban)) return false;

  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (char) =>
    String(char.charCodeAt(0) - 55)
  );

  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    const block = String(remainder) + numeric.slice(i, i + 7);
    remainder = Number(block) % 97;
  }

  return remainder === 1;
}

export function formatIbanInput(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .replace(/(.{4})/g, "$1 ")
    .trim();
}
