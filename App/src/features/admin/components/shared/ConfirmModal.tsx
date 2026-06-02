import type { ReactNode } from "react";

interface ConfirmModalProps {
  title: string;
  description: ReactNode;
  preview?: ReactNode;
  confirmLabel?: string;
  confirmClass?: string;
  onConfirm: () => void;
  onDecline: () => void;
}

export function ConfirmModal({
  title,
  description,
  preview,
  confirmLabel = "Bevestigen",
  confirmClass = "bg-[#F25B29]",
  onConfirm,
  onDecline,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg p-6 w-full max-w-2xl">
        <h3 className="text-white font-black text-lg mb-3">{title}</h3>
        <div className="text-gray-400 text-sm mb-4">{description}</div>
        {preview && (
          <div className="rounded-md bg-[#0D0D0D] border border-[#1A1A1A] p-3 mb-4 text-sm max-h-48 overflow-auto">
            {preview}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button
            onClick={onDecline}
            className="px-4 py-2 bg-[#2A2A2A] text-gray-300 rounded font-bold"
          >
            Annuleren
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded font-bold ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
