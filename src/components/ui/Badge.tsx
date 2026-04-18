import type { WorkoutBadge } from "@/types/database";

const BADGE_CONFIG: Record<WorkoutBadge, { label: string; emoji: string; color: string }> = {
  chest: { label: "胸", emoji: "💪", color: "#ef4444" },
  back: { label: "背中", emoji: "🏋️", color: "#8b5cf6" },
  legs: { label: "脚", emoji: "🦵", color: "#3b82f6" },
  shoulders: { label: "肩", emoji: "⚡", color: "#f59e0b" },
  arms: { label: "腕", emoji: "💥", color: "#10b981" },
  core: { label: "体幹", emoji: "🔥", color: "#f97316" },
  cardio: { label: "有酸素", emoji: "❤️", color: "#ec4899" },
  full_body: { label: "全身", emoji: "🚀", color: "#06b6d4" },
};

export default function Badge({ badge, animated }: { badge: WorkoutBadge; animated?: boolean }) {
  const config = BADGE_CONFIG[badge];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${animated ? "animate-badge-pop" : ""}`}
      style={{
        background: `${config.color}22`,
        border: `1px solid ${config.color}66`,
        color: config.color,
      }}
    >
      {config.emoji} {config.label}
    </span>
  );
}

export { BADGE_CONFIG };
