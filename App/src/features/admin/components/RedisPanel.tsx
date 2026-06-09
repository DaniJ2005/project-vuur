import type { AdminRefreshToken } from "../admin.types";
import { LoadingRows } from "./shared/LoadingRows";

interface RedisPanelProps {
  tokens: AdminRefreshToken[];
  isLoading: boolean;
  isBusy: boolean;
  onRevoke: (token: string) => void;
}

export function RedisPanel({ tokens, isLoading, isBusy, onRevoke }: RedisPanelProps) {
  return (
    <section className="rounded-lg border border-[#1E1E1E] bg-[#111] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1A1A1A] flex items-center justify-between">
        <h2 className="text-white font-black">Redis refresh tokens</h2>
        <span className="text-gray-500 text-sm">{tokens.length} actief</span>
      </div>
      {isLoading ? (
        <LoadingRows />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-gray-500 uppercase text-xs">
              <tr>
                <th className="text-left px-5 py-3">Token</th>
                <th className="text-left px-5 py-3">User ID</th>
                <th className="text-left px-5 py-3">Verloopt</th>
                <th className="text-right px-5 py-3">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {tokens.map((token) => (
                <tr key={token.token} className="hover:bg-[#151515]">
                  <td className="px-5 py-3 text-white font-mono">{token.tokenPreview}</td>
                  <td className="px-5 py-3 font-mono text-gray-500">{token.userId}</td>
                  <td className="px-5 py-3">
                    {token.expiresAt ? new Date(token.expiresAt).toLocaleString() : "-"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => onRevoke(token.token)}
                      disabled={isBusy}
                      className="border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-md px-3 py-1.5 text-xs font-bold cursor-pointer"
                    >
                      Intrekken
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tokens.length === 0 && (
            <p className="text-gray-500 p-5 text-sm">Geen actieve tokens gevonden.</p>
          )}
        </div>
      )}
    </section>
  );
}
