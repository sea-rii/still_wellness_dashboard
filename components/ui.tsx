// components/ui.tsx
import type { ReactNode, InputHTMLAttributes, ButtonHTMLAttributes } from "react";

export function StillCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-[28px] bg-[rgb(var(--surface))]",
        "shadow-[0_20px_55px_rgba(0,0,0,0.10)]",
        "ring-1 ring-[rgba(0,0,0,0.06)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function StillCardInner({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-10 ${className}`}>{children}</div>;
}

export function StillLabel({ children }: { children: ReactNode }) {
  return (
    <label className="font-[var(--font-serif)] text-[18px] text-[rgba(var(--text),0.78)]">
      {children}
    </label>
  );
}

export function StillInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-full bg-[rgb(var(--input))] px-6 py-3",
        "text-[rgba(var(--text),0.9)] placeholder:text-[rgba(var(--text),0.45)]",
        "outline-none ring-0 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]",
        "transition",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

export function StillTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[
        "w-full rounded-[24px] bg-[rgb(var(--input))] px-6 py-4",
        "text-[rgba(var(--text),0.9)] placeholder:text-[rgba(var(--text),0.45)]",
        "outline-none ring-0 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]",
        "transition min-h-[160px] resize-none",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

export function StillButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={[
        "rounded-full bg-[rgba(255,255,255,0.82)] px-6 py-3",
        "font-medium text-[rgba(var(--text),0.92)]",
        "shadow-[0_10px_25px_rgba(0,0,0,0.10)]",
        "hover:bg-white transition disabled:opacity-60",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

export function StillPill({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-4 py-2",
        "bg-[rgba(255,255,255,0.65)] ring-1 ring-[rgba(0,0,0,0.06)]",
        "text-[rgba(var(--text),0.8)]",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export function StillH1({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-[var(--font-serif)] text-6xl tracking-tight text-[rgba(var(--text),0.95)]">
      {children}
    </h1>
  );
}

export function StillH2({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-[var(--font-serif)] text-4xl tracking-tight text-[rgba(var(--text),0.95)]">
      {children}
    </h2>
  );
}

export function StillMuted({ children }: { children: ReactNode }) {
  return <p className="text-[rgba(var(--text),0.62)]">{children}</p>;
}
