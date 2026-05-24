// Small inline "Soon" pill for features that are intentionally not yet wired,
// so a disabled control reads as "coming soon" rather than "broken".
export default function ComingSoon() {
  return (
    <span
      className="ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ backgroundColor: "var(--accent-dim)", color: "var(--accent)" }}
    >
      Soon
    </span>
  );
}
