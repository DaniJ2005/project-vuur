import type { AdminAnalytics } from "../admin.types";
import { LoadingRows } from "./shared/LoadingRows";

interface AnalyticsPanelProps {
  data?: AdminAnalytics;
  isLoading: boolean;
}

export function AnalyticsPanel({ data, isLoading }: AnalyticsPanelProps) {
  if (isLoading) return <LoadingRows />;

  const stats = [
    { label: "Bestellingen", value: data?.totalOrders ?? 0, description: "Aantal bestellingen in het systeem." },
    { label: "Betalingen", value: data?.totalPayments ?? 0, description: "Aantal afgeronde betalingstransacties." },
    { label: "Wishlist acties", value: data?.totalWishlistItems ?? 0, description: "Hoe vaak producten zijn toegevoegd aan wishlist." },
    { label: "Gebruikers", value: data?.totalUsers ?? 0, description: "Aantal geregistreerde gebruikers." },
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-[#1E1E1E] bg-[#111] p-8">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div>
            <p className="text-[#F25B29] text-xs font-black uppercase tracking-wider mb-2">Analytics</p>
            <h2 className="text-white text-2xl font-black">Realtime verkoop en activiteit</h2>
            <p className="text-gray-500 text-sm mt-2 max-w-2xl">
              Inzicht in bestellingen, betalingen en populaire producten. Deze cijfers zijn gebaseerd op de huidige database.
            </p>
          </div>
          <div className="rounded-full border border-[#2A2A2A] px-4 py-2 text-sm text-gray-300 bg-[#0D0D0D]">
            Laatste update: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-[#1E1E1E] bg-[#111] p-5">
            <p className="text-gray-500 text-xs font-black uppercase tracking-wider">{stat.label}</p>
            <p className="text-white text-3xl font-black mt-3">{stat.value}</p>
            <p className="text-gray-500 text-sm mt-2">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
        <div className="rounded-lg border border-[#1E1E1E] bg-[#111] p-5">
          <h3 className="text-white font-black mb-4">Top bestelde producten</h3>
          <ul className="space-y-3 text-sm text-gray-300">
            {(data?.topProducts.length
              ? data.topProducts
              : [{ productId: "-", productName: "Nog geen orders", orderCount: 0 }]
            ).map((product) => (
              <li key={product.productId} className="rounded-lg border border-[#1A1A1A] bg-[#0D0D0D] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-white truncate">{product.productName}</p>
                    <p className="text-gray-500 text-xs truncate">ID: {product.productId}</p>
                  </div>
                  <span className="text-sm text-[#F25B29] font-black">{product.orderCount}x</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-[#1E1E1E] bg-[#111] p-5">
          <h3 className="text-white font-black mb-4">Tracking status</h3>
          <p className="text-gray-500 text-sm mb-4">
            De frontend kent momenteel nog geen pageview-tracking. Voor live bekijkstatistieken kan dit later gekoppeld worden aan een aparte analytics-collectie.
          </p>
          <div className="space-y-3">
            <div className="rounded-lg border border-[#1A1A1A] bg-[#0D0D0D] p-4">
              <p className="text-white font-bold">Bekeken productpagina's</p>
              <p className="text-gray-500 text-sm mt-2">Nog geen event tracking beschikbaar.</p>
            </div>
            <div className="rounded-lg border border-[#1A1A1A] bg-[#0D0D0D] p-4">
              <p className="text-white font-bold">Conversie</p>
              <p className="text-gray-500 text-sm mt-2">
                Laat zien hoeveel bezoekers tot een bestelling komen zodra tracking is toegevoegd.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
