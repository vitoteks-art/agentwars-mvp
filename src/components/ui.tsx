import Link from "next/link";

export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 md:px-6 ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition will-change-transform hover:-translate-y-0.5 active:translate-y-0";
  const styles =
    variant === "primary"
      ? "bg-[linear-gradient(135deg,var(--aw-accent),var(--aw-accent2))] text-black shadow-[0_0_40px_rgba(124,58,237,0.25)]"
      : "bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10";

  if (href) {
    return (
      <Link href={href} className={`${base} ${styles} ${className}`}>
        {children}
      </Link>
    );
  }

  return (
    <button className={`${base} ${styles} ${className}`} type="button">
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warn";
}) {
  const toneCls =
    tone === "good"
      ? "bg-emerald-400/10 text-emerald-200 ring-1 ring-emerald-400/20"
      : tone === "warn"
        ? "bg-amber-400/10 text-amber-200 ring-1 ring-amber-400/20"
        : "bg-white/5 text-zinc-200 ring-1 ring-white/10";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${toneCls}`}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  kicker,
  title,
  desc,
}: {
  kicker?: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mb-6">
      {kicker ? (
        <div className="mb-2 text-xs font-extrabold tracking-[0.18em] text-violet-200/90">
          {kicker.toUpperCase()}
        </div>
      ) : null}
      <h2 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
        {title}
      </h2>
      {desc ? <p className="mt-2 text-sm text-zinc-300">{desc}</p> : null}
    </div>
  );
}
