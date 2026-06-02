import { useMemo, useState } from "react";
import { useAdminPostgresTables } from "@/features/admin/hooks/admin.postgres.hooks";
import { useAdminMongoProducts } from "@/features/admin/hooks/admin.mongo.hooks";
import { useAdminRefreshTokens, useRevokeRefreshToken } from "@/features/admin/hooks/admin.redis.hooks";
import { useAdminAnalytics } from "@/features/admin/hooks/admin.analytics.hooks";
import { useAdminActivityLog } from "@/features/admin/hooks/admin.activity.hooks";
import { usePostgresEditor } from "@/features/admin/hooks/usePostgresEditor";
import { useProductEditor } from "@/features/admin/hooks/useProductEditor";

import { OverviewPanel } from "@/features/admin/components/OverviewPanel";
import { MongoPanel } from "@/features/admin/components/MongoPanel";
import { PostgresPanel } from "@/features/admin/components/PostgresPanel";
import { RedisPanel } from "@/features/admin/components/RedisPanel";
import { AnalyticsPanel } from "@/features/admin/components/AnalyticsPanel";
import { ActivityPanel } from "@/features/admin/components/ActivityPanel";

type AdminTab = "overview" | "mongo" | "postgres" | "redis" | "analytics" | "activity";

const tabs: { id: AdminTab; label: string }[] = [
  { id: "overview", label: "Overzicht" },
  { id: "mongo", label: "MongoDB" },
  { id: "postgres", label: "Postgres" },
  { id: "redis", label: "Redis" },
  { id: "analytics", label: "Analytics" },
  { id: "activity", label: "Activiteit" },
];

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [selectedTableName, setSelectedTableName] = useState("users");
  const [message, setMessage] = useState("");

  const postgres = useAdminPostgresTables();
  const mongoProducts = useAdminMongoProducts();
  const refreshTokens = useAdminRefreshTokens();
  const analytics = useAdminAnalytics();
  const activity = useAdminActivityLog();
  const revokeRefreshToken = useRevokeRefreshToken();

  const postgresEditor = usePostgresEditor(setMessage);
  const productEditor = useProductEditor(setMessage, mongoProducts.refetch);

  const selectedTable = useMemo(
    () => postgres.data?.find((t) => t.name === selectedTableName) ?? postgres.data?.[0],
    [postgres.data, selectedTableName]
  );

  return (
    <div className="pt-16 min-h-screen bg-[#0D0D0D] text-gray-300">
      <div className="border-b border-[#1A1A1A] bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-[#F25B29] text-xs font-black uppercase tracking-wider mb-2">Admin</p>
          <h1 className="text-3xl font-black text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Beheer MongoDB, Postgres en Redis data vanuit een centrale console.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 border-b border-[#1A1A1A] mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "border-[#F25B29] text-[#F25B29]"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {message && (
          <div className="mb-5 rounded-lg border border-[#F25B29]/30 bg-[#F25B29]/10 px-4 py-3 text-sm text-[#F25B29]">
            {message}
          </div>
        )}

        {activeTab === "overview" && (
          <OverviewPanel
            productCount={mongoProducts.data?.length ?? 0}
            tableCount={postgres.data?.length ?? 0}
            postgresRowCount={postgres.data?.reduce((sum, t) => sum + t.rows.length, 0) ?? 0}
            tokenCount={refreshTokens.data?.length ?? 0}
            isLoading={postgres.isLoading || mongoProducts.isLoading || refreshTokens.isLoading}
          />
        )}

        {activeTab === "mongo" && (
          <MongoPanel
            products={mongoProducts.data ?? []}
            isLoading={mongoProducts.isLoading}
            editor={productEditor}
          />
        )}

        {activeTab === "postgres" && (
          <PostgresPanel
            tables={postgres.data ?? []}
            selectedTable={selectedTable}
            selectedTableName={selectedTableName}
            isLoading={postgres.isLoading}
            editor={postgresEditor}
            onSelectTable={setSelectedTableName}
          />
        )}

        {activeTab === "redis" && (
          <RedisPanel
            tokens={refreshTokens.data ?? []}
            isLoading={refreshTokens.isLoading}
            isBusy={revokeRefreshToken.isPending}
            onRevoke={async (token) => {
              setMessage("");
              await revokeRefreshToken.mutateAsync(token);
              setMessage("Refresh token ingetrokken.");
            }}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsPanel data={analytics.data} isLoading={analytics.isLoading} />
        )}

        {activeTab === "activity" && (
          <ActivityPanel activities={activity.data ?? []} isLoading={activity.isLoading} />
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;