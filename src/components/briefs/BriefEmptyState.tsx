import { EmptyState } from "@/components/system/EmptyState";

export function BriefEmptyState({ mode, onAction }: { mode: "watchlist" | "history"; onAction: () => void }) {
  return (
    <EmptyState
      actionLabel={mode === "watchlist" ? "Choose stocks" : "Clear filters"}
      description={mode === "watchlist" ? "Add companies to the shared watchlist to connect each brief to the names you follow." : "No local briefs match the selected filters."}
      onAction={onAction}
      title={mode === "watchlist" ? "Make this brief yours" : "No matching briefs"}
    />
  );
}
