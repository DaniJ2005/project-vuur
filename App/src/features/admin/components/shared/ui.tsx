import type { ReactNode } from "react";

// ── Badge 
const badgeVariants = {
  orange:  "bg-[#F25B29]/15 text-[#F25B29] border border-[#F25B29]/20",
  green:   "bg-green-500/15 text-green-400 border border-green-500/20",
  red:     "bg-red-500/15 text-red-400 border border-red-500/20",
  gray:    "bg-[#1A1A1A] text-gray-400 border border-[#2A2A2A]",
  blue:    "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  yellow:  "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
} as const;

type BadgeVariant = keyof typeof badgeVariants;

export function Badge({ children, variant = "gray" }: { children: ReactNode; variant?: BadgeVariant }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${badgeVariants[variant]}`}>
      {children}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  const variant: BadgeVariant =
    status === "paid"      ? "green"  :
    status === "fulfilled" ? "blue"   :
    status === "cancelled" ? "red"    :
    status === "pending"   ? "yellow" : "gray";

  return <Badge variant={variant}>{status}</Badge>;
}

export function RoleBadge({ role }: { role: string }) {
  return <Badge variant={role === "admin" ? "orange" : "gray"}>{role}</Badge>;
}

// ── Panel header 
export function PanelHeader({
  title,
  count,
  action,
}: {
  title: string;
  count?: number;
  action?: ReactNode;
}) {
  return (
    <div className="px-5 py-4 border-b border-[#1A1A1A] flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <h2 className="text-white font-black">{title}</h2>
        {count !== undefined && (
          <span className="text-xs text-gray-500 bg-[#1A1A1A] px-2 py-0.5 rounded font-bold">
            {count}
          </span>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ── Search input 
export function SearchInput({
  value,
  onChange,
  placeholder = "Zoeken...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="px-5 py-3 border-b border-[#1A1A1A]">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0D0D0D] border border-[#2A2A2A] text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F25B29] placeholder-gray-600"
      />
    </div>
  );
}

// ── Empty state 
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-600">
      <div className="text-4xl mb-3">—</div>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ── Icon buttons 
export function EditButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="border border-[#2A2A2A] hover:border-[#F25B29]/40 text-gray-400 hover:text-[#F25B29] rounded-md px-3 py-1.5 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
    >
      Bewerken
    </button>
  );
}

export function DeleteButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-1.5 text-red-500/60 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      title="Verwijderen"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="bg-[#F25B29] hover:bg-[#d94e22] disabled:bg-[#3A2219] disabled:text-gray-500 text-white rounded-lg px-4 py-2 text-sm font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="border border-[#2A2A2A] text-gray-400 hover:text-white rounded-lg px-4 py-2 text-sm font-bold transition-all cursor-pointer disabled:opacity-40"
    >
      {children}
    </button>
  );
}

// ── Form field 
export function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </label>
  );
}

export const inputClass =
  "w-full bg-[#0D0D0D] border border-[#2A2A2A] text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F25B29]";

export const selectClass =
  "w-full bg-[#0D0D0D] border border-[#2A2A2A] text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F25B29]";
