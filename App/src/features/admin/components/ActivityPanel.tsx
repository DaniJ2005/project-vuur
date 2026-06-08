import type { AdminActivityEntry } from "../admin.types";
import { LoadingRows } from "./shared/LoadingRows";

interface ActivityPanelProps {
  activities: AdminActivityEntry[];
  isLoading: boolean;
}

export function ActivityPanel({ activities, isLoading }: ActivityPanelProps) {
  if (isLoading) return <LoadingRows />;

  return (
    <section className="rounded-lg border border-[#1E1E1E] bg-[#111] p-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[#F25B29] text-xs font-black uppercase tracking-wider mb-2">Activiteit</p>
          <h2 className="text-white text-2xl font-black">Recente database acties</h2>
        </div>
        <span className="text-gray-500 text-sm">Laatste 20 gebeurtenissen</span>
      </div>

      {activities.length === 0 ? (
        <div className="mt-8 text-gray-500 text-sm">Er zijn nog geen recente acties beschikbaar.</div>
      ) : (
        <div className="mt-6 space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="rounded-lg border border-[#1A1A1A] bg-[#0D0D0D] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-gray-300 text-sm">{activity.description}</p>
                <span className="text-gray-500 text-xs">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
