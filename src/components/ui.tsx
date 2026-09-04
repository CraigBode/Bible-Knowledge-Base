import Link from "next/link";
import type { ReactNode } from "react";
import {
  STATUS_META,
  LANG_META,
  type StudyStatus,
  type Lang,
  type XrefType,
  XREF_TYPES,
} from "@/lib/exegesis";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-gold-500">
            {eyebrow}
          </div>
        )}
        <h1 className="font-serif text-3xl font-semibold text-ink-900">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-ink-700">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: StudyStatus }) {
  const m = STATUS_META[status];
  return <span className={`chip ${m.className}`}>{m.label}</span>;
}

export function LangBadge({ lang }: { lang: Lang }) {
  const m = LANG_META[lang];
  return <span className={`chip ${m.className}`}>{m.label}</span>;
}

export function ThemeChip({
  theme,
  link = true,
}: {
  theme: { name: string; slug: string; color: string };
  link?: boolean;
}) {
  const style = {
    backgroundColor: `${theme.color}1a`,
    color: theme.color,
    borderColor: `${theme.color}55`,
  };
  const cls = "chip border";
  if (!link)
    return (
      <span className={cls} style={style}>
        {theme.name}
      </span>
    );
  return (
    <Link href={`/themes/${theme.slug}`} className={`${cls} hover:opacity-80`} style={style}>
      {theme.name}
    </Link>
  );
}

export function XrefBadge({ type }: { type: XrefType }) {
  const label = XREF_TYPES.find((x) => x.value === type)?.label ?? type;
  const colors: Record<XrefType, string> = {
    parallel: "bg-sky-100 text-sky-800",
    quotation: "bg-rose-100 text-rose-800",
    allusion: "bg-amber-100 text-amber-800",
    typology: "bg-violet-100 text-violet-800",
    fulfillment: "bg-emerald-100 text-emerald-800",
    contrast: "bg-stone-200 text-stone-700",
    thematic: "bg-teal-100 text-teal-800",
  };
  return <span className={`chip ${colors[type]}`}>{label}</span>;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 font-serif text-4xl text-parchment-300">¶</div>
      <h3 className="font-serif text-lg font-semibold text-ink-900">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-ink-700">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <div className="card h-full p-4 transition-shadow hover:shadow-md">
      <div className="text-xs font-semibold uppercase tracking-widest text-ink-700/70">
        {label}
      </div>
      <div className="mt-1 font-serif text-3xl font-semibold text-oxblood-700">{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-700/70">{hint}</div>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function SectionTitle({
  children,
  count,
  right,
}: {
  children: ReactNode;
  count?: number;
  right?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-ink-900">
        {children}
        {typeof count === "number" && (
          <span className="rounded-full bg-parchment-200 px-2 py-0.5 text-xs font-medium text-ink-700">
            {count}
          </span>
        )}
      </h2>
      {right}
    </div>
  );
}
