const PARTNERS = [
  "NordKapital",
  "Vertrauensbank",
  "BankNova",
  "SolidBank",
  "Rheinkredit",
  "FairFinanz",
  "Kapitalis",
  "TreuBank",
];

export default function BankMarquee() {
  const items = [...PARTNERS, ...PARTNERS];

  return (
    <div
      className="hidden xl:block fixed top-1/2 right-6 -translate-y-1/2 h-[60vh] w-40 pointer-events-none z-0"
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
      }}
      aria-hidden="true"
    >
      <div className="flex flex-col animate-marquee-vertical">
        {items.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="flex items-center justify-center h-16 shrink-0 text-sm font-semibold text-muted/50 tracking-wide"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
