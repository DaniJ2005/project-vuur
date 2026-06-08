import type { ReactNode } from "react";
import { SecondaryButton } from "./ui";

interface ConfirmModalProps {
  title: string;
  description: ReactNode;
  preview?: ReactNode;
  confirmLabel?: string;
  confirmClass?: string;
  isBusy?: boolean;
  onConfirm: () => void;
  onDecline: () => void;
}

export function ConfirmModal({
  title,
  description,
  preview,
  confirmLabel = "Bevestigen",
  confirmClass,
  isBusy,
  onConfirm,
  onDecline,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-[#1E1E1E] rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-white font-black text-lg mb-2">{title}</h3>
        <div className="text-gray-400 text-sm mb-4">{description}</div>
        {preview && (
          <div className="rounded-lg bg-[#0D0D0D] border border-[#1A1A1A] p-3 mb-5 text-sm space-y-1 max-h-48 overflow-auto">
            {preview}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <SecondaryButton onClick={onDecline} disabled={isBusy}>
            Annuleren
          </SecondaryButton>
          <button
            onClick={onConfirm}
            disabled={isBusy}
            className={`px-4 py-2 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              confirmClass ?? "bg-[#F25B29] hover:bg-[#d94e22]"
            }`}
          >
            {isBusy ? "Bezig..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-gray-300 py-0.5">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="font-mono text-right truncate ml-4">{value || "—"}</span>
    </div>
  );
}