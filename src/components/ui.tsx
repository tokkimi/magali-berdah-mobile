import type { ReactNode } from 'react';

export function PageHeader({ title, subtitle, action }: { title: ReactNode; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: string }) {
  return (
    <div className="card">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent || 'text-gray-900'}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

export function EmptyState({ title, text, children }: { title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center justify-center py-14 text-center">
      <p className="font-semibold text-gray-900">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-gray-500">{text}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

// Simple SVG bar chart (no external deps)
export function BarChart({ data, format }: { data: { label: string; cents: number }[]; format: (c: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.cents));
  return (
    <div className="flex h-48 items-end gap-2">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t bg-brand-500 transition-all hover:bg-brand-600"
              style={{ height: `${(d.cents / max) * 100}%`, minHeight: d.cents > 0 ? 4 : 0 }}
              title={format(d.cents)}
            />
          </div>
          <span className="text-[10px] text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
