import { create } from "zustand";
import type { WorkoutExercise, WorkoutBadge } from "@/types/database";

const EXERCISE_BADGE_MAP: Record<string, WorkoutBadge> = {
  ベンチプレス: "chest",
  プッシュアップ: "chest",
  ダンベルフライ: "chest",
  懸垂: "back",
  デッドリフト: "back",
  ラットプルダウン: "back",
  スクワット: "legs",
  レッグプレス: "legs",
  ランジ: "legs",
  ショルダープレス: "shoulders",
  サイドレイズ: "shoulders",
  バーベルカール: "arms",
  トライセプス: "arms",
  プランク: "core",
  クランチ: "core",
  ランニング: "cardio",
  バーピー: "full_body",
};

type WorkoutState = {
  exercises: WorkoutExercise[];
  timerSeconds: number;
  isTimerRunning: boolean;
  isVerified: boolean;
  sessionId: string | null;
  addExercise: (exercise: WorkoutExercise) => void;
  removeExercise: (index: number) => void;
  setTimerSeconds: (s: number) => void;
  setTimerRunning: (running: boolean) => void;
  setVerified: (v: boolean, sessionId?: string) => void;
  reset: () => void;
  getBadges: () => WorkoutBadge[];
};

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  exercises: [],
  timerSeconds: 0,
  isTimerRunning: false,
  isVerified: false,
  sessionId: null,

  addExercise: (exercise) =>
    set((s) => ({ exercises: [...s.exercises, exercise] })),

  removeExercise: (index) =>
    set((s) => ({ exercises: s.exercises.filter((_, i) => i !== index) })),

  setTimerSeconds: (timerSeconds) => set({ timerSeconds }),
  setTimerRunning: (isTimerRunning) => set({ isTimerRunning }),

  setVerified: (isVerified, sessionId) => set({ isVerified, sessionId: sessionId ?? null }),

  reset: () =>
    set({ exercises: [], timerSeconds: 0, isTimerRunning: false, isVerified: false, sessionId: null }),

  getBadges: () => {
    const { exercises } = get();
    const badges = new Set<WorkoutBadge>();
    exercises.forEach((ex) => {
      const badge = EXERCISE_BADGE_MAP[ex.name] ?? ex.badge;
      if (badge) badges.add(badge);
    });
    return Array.from(badges);
  },
}));

export { EXERCISE_BADGE_MAP };
