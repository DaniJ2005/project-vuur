import { LoadingRows } from "./shared/LoadingRows";

function statLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

interface OverviewPanelProps {
  productCount: number;
  tableCount: number;
  postgresRowCount: number;
  tokenCount: number;
  isLoading: boolean;
}

export function OverviewPanel({
  productCount,
  tableCount,
  postgresRowCount,
  tokenCount,
  isLoading,
}: OverviewPanelProps) {
  const cards = [
    { label: "MongoDB", value: statLabel(productCount, "product", "producten") },
    { label: "Postgres", value: `${tableCount} tabellen, ${postgresRowCount} rijen` },
    { label: "Redis", value: statLabel(tokenCount, "sessie", "sessies") },
    { label: "Analytics", value: "Tab klaar voor integratie" },
  ];

  if (isLoading) return <LoadingRows />;

  return (
    <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-[#1E1E1E] bg-[#111] p-5">
          <p className="text-gray-500 text-xs font-black uppercase tracking-wider">{card.label}</p>
          <p className="text-white text-2xl font-black mt-3">{card.value}</p>
        </div>
      ))}
    </section>
  );
}
