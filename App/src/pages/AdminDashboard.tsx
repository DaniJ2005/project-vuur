import { useState } from "react";
import { useAdminMongoProducts } from "@/features/admin/hooks/admin.mongo.hooks";
import { useAdminRefreshTokens, useRevokeRefreshToken } from "@/features/admin/hooks/admin.redis.hooks";
import { useAdminAnalytics } from "@/features/admin/hooks/admin.analytics.hooks";
import { useAdminActivityLog } from "@/features/admin/hooks/admin.activity.hooks";
import { useProductEditor } from "@/features/admin/hooks/useProductEditor";

import { MongoPanel }     from "@/features/admin/components/MongoPanel";
import { RedisPanel }     from "@/features/admin/components/RedisPanel";
import { AnalyticsPanel } from "@/features/admin/components/AnalyticsPanel";
import { ActivityPanel }  from "@/features/admin/components/ActivityPanel";

import { UsersPanel }     from "@/features/admin/components/panels/UsersPanel";
import { OrdersPanel }    from "@/features/admin/components/panels/OrdersPanel";
import { AddressesPanel } from "@/features/admin/components/panels/AddressesPanel";
import { WishlistPanel }  from "@/features/admin/components/panels/WishlistPanel";

import { useAdminUsers }     from "@/features/admin/hooks/admin.domain.hooks";
import { useAdminOrders }    from "@/features/admin/hooks/admin.domain.hooks";
import { useAdminAddresses } from "@/features/admin/hooks/admin.domain.hooks";
import { useAdminWishlist }  from "@/features/admin/hooks/admin.domain.hooks";

type AdminTab =
  | "overview"
  | "mongo"
  | "users"
  | "orders"
  | "addresses"
  | "wishlist"
  | "redis"
  | "analytics"
  | "activity";

const tabs: { id: AdminTab; label: string }[] = [
  { id: "overview",   label: "Overzicht"   },
  { id: "mongo",      label: "Producten"   },
  { id: "users",      label: "Gebruikers"  },
  { id: "orders",     label: "Bestellingen"},
  { id: "addresses",  label: "Adressen"    },
  { id: "wishlist",   label: "Verlanglijst"},
  { id: "redis",      label: "Sessies"     },
  { id: "analytics",  label: "Analytics"   },
  { id: "activity",   label: "Activiteit"  },
];

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [message, setMessage]     = useState("");

  const mongoProducts    = useAdminMongoProducts();
  const refreshTokens    = useAdminRefreshTokens();
  const analytics        = useAdminAnalytics();
  const activity         = useAdminActivityLog();
  const revokeToken      = useRevokeRefreshToken();
  const productEditor    = useProductEditor(setMessage, mongoProducts.refetch);

  // Overview counts
  const users     = useAdminUsers();
  const orders    = useAdminOrders();
  const addresses = useAdminAddresses();
  const wishlist  = useAdminWishlist();

  return (
    <div className="pt-16 min-h-screen bg-[#0D0D0D] text-gray-300">
      {/* Header */}
      <div className="border-b border-[#1A1A1A] bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-[#F25B29] text-xs font-black uppercase tracking-wider mb-2">Admin</p>
          <h1 className="text-3xl font-black text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Beheer producten, gebruikers, bestellingen en meer vanuit één console.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-[#1A1A1A] mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMessage(""); }}
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

        {/* Global message */}
        {message && (
          <div className="mb-5 rounded-lg border border-[#F25B29]/30 bg-[#F25B29]/10 px-4 py-3 text-sm text-[#F25B29] flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage("")} className="text-[#F25B29]/60 hover:text-[#F25B29] ml-4">✕</button>
          </div>
        )}

        {/* Panels */}
        {activeTab === "overview" && (
          <OverviewPanel
            productCount={mongoProducts.data?.length  ?? 0}
            userCount={users.data?.length             ?? 0}
            orderCount={orders.data?.length           ?? 0}
            addressCount={addresses.data?.length      ?? 0}
            wishlistCount={wishlist.data?.length      ?? 0}
            tokenCount={refreshTokens.data?.length    ?? 0}
            isLoading={mongoProducts.isLoading || users.isLoading || orders.isLoading}
          />
        )}
        {activeTab === "mongo"     && <MongoPanel products={mongoProducts.data ?? []} isLoading={mongoProducts.isLoading} editor={productEditor} />}
        {activeTab === "users"     && <UsersPanel />}
        {activeTab === "orders"    && <OrdersPanel />}
        {activeTab === "addresses" && <AddressesPanel />}
        {activeTab === "wishlist"  && <WishlistPanel />}
        {activeTab === "redis"     && (
          <RedisPanel
            tokens={refreshTokens.data ?? []}
            isLoading={refreshTokens.isLoading}
            isBusy={revokeToken.isPending}
            onRevoke={async (token) => {
              await revokeToken.mutateAsync(token);
              setMessage("Refresh token ingetrokken.");
            }}
          />
        )}
        {activeTab === "analytics" && <AnalyticsPanel data={analytics.data} isLoading={analytics.isLoading} />}
        {activeTab === "activity"  && <ActivityPanel activities={activity.data ?? []} isLoading={activity.isLoading} />}
      </div>
    </div>
  );
}

// ── Overview panel ────────────────────────────────────────────────────────────

function OverviewPanel({
  productCount, userCount, orderCount, addressCount, wishlistCount, tokenCount, isLoading,
}: {
  productCount: number; userCount: number; orderCount: number;
  addressCount: number; wishlistCount: number; tokenCount: number; isLoading: boolean;
}) {
  const cards = [
    { label: "Producten",    value: productCount,  sub: "MongoDB"   },
    { label: "Gebruikers",   value: userCount,      sub: "Postgres"  },
    { label: "Bestellingen", value: orderCount,     sub: "Postgres"  },
    { label: "Adressen",     value: addressCount,   sub: "Postgres"  },
    { label: "Verlanglijst", value: wishlistCount,  sub: "Postgres"  },
    { label: "Sessies",      value: tokenCount,     sub: "Redis"     },
  ];

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-[#1E1E1E] bg-[#111] p-5 animate-pulse">
            <div className="h-3 w-20 bg-[#1E1E1E] rounded mb-4" />
            <div className="h-8 w-12 bg-[#1E1E1E] rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-[#1E1E1E] bg-[#111] p-5">
          <div className="flex items-start justify-between">
            <p className="text-gray-500 text-xs font-black uppercase tracking-wider">{card.label}</p>
            <span className="text-xs text-gray-600 bg-[#0D0D0D] border border-[#1A1A1A] px-2 py-0.5 rounded">
              {card.sub}
            </span>
          </div>
          <p className="text-white text-3xl font-black mt-3">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;