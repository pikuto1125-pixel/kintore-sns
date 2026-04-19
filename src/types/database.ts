export type WorkoutBadge = "chest"|"back"|"legs"|"shoulders"|"arms"|"core"|"cardio"|"full_body";
export type WorkoutExercise = { name: string; reps: number; sets: number; badge: WorkoutBadge };
export type NotificationType = "like" | "follow";
export type ChallengeStatus = "pending" | "active" | "completed";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; username: string; display_name: string | null;
          avatar_url: string | null; bio: string | null;
          last_trained_at: string | null; can_post: boolean;
          current_streak: number; longest_streak: number;
          follower_count: number; following_count: number;
          total_workouts: number; total_reps: number;
          title: string | null; created_at: string;
        };
        Insert: {
          id: string; username: string; display_name?: string | null;
          avatar_url?: string | null; bio?: string | null;
          last_trained_at?: string | null; can_post?: boolean;
          current_streak?: number; longest_streak?: number;
          follower_count?: number; following_count?: number;
          total_workouts?: number; total_reps?: number;
          title?: string | null; created_at?: string;
        };
        Update: {
          id?: string; username?: string; display_name?: string | null;
          avatar_url?: string | null; bio?: string | null;
          last_trained_at?: string | null; can_post?: boolean;
          current_streak?: number; longest_streak?: number;
          follower_count?: number; following_count?: number;
          total_workouts?: number; total_reps?: number;
          title?: string | null; created_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string; user_id: string; content: string;
          badges: string[]; workout_session_id: string | null;
          image_url: string | null; likes_count: number; created_at: string;
        };
        Insert: {
          id?: string; user_id: string; content: string;
          badges?: string[]; workout_session_id?: string | null;
          image_url?: string | null; likes_count?: number; created_at?: string;
        };
        Update: {
          id?: string; user_id?: string; content?: string;
          badges?: string[]; workout_session_id?: string | null;
          image_url?: string | null; likes_count?: number; created_at?: string;
        };
        Relationships: [{ foreignKeyName: "posts_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] }];
      };
      workout_sessions: {
        Row: {
          id: string; user_id: string; exercises: Json;
          total_reps: number; duration_seconds: number;
          verified: boolean; created_at: string;
        };
        Insert: {
          id?: string; user_id: string; exercises: Json;
          total_reps: number; duration_seconds: number;
          verified?: boolean; created_at?: string;
        };
        Update: {
          id?: string; user_id?: string; exercises?: Json;
          total_reps?: number; duration_seconds?: number;
          verified?: boolean; created_at?: string;
        };
        Relationships: [{ foreignKeyName: "workout_sessions_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] }];
      };
      likes: {
        Row: { id: string; user_id: string; post_id: string; created_at: string };
        Insert: { id?: string; user_id: string; post_id: string; created_at?: string };
        Update: { id?: string; user_id?: string; post_id?: string; created_at?: string };
        Relationships: [
          { foreignKeyName: "likes_post_id_fkey"; columns: ["post_id"]; referencedRelation: "posts"; referencedColumns: ["id"] },
          { foreignKeyName: "likes_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ];
      };
      follows: {
        Row: { id: string; follower_id: string; following_id: string; created_at: string };
        Insert: { id?: string; follower_id: string; following_id: string; created_at?: string };
        Update: { id?: string; follower_id?: string; following_id?: string; created_at?: string };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string; user_id: string; type: string;
          actor_id: string; post_id: string | null;
          read: boolean; created_at: string;
        };
        Insert: {
          id?: string; user_id: string; type: string;
          actor_id: string; post_id?: string | null;
          read?: boolean; created_at?: string;
        };
        Update: {
          id?: string; user_id?: string; type?: string;
          actor_id?: string; post_id?: string | null;
          read?: boolean; created_at?: string;
        };
        Relationships: [];
      };
      challenges: {
        Row: {
          id: string; creator_id: string; opponent_id: string;
          title: string; goal_reps: number;
          creator_reps: number; opponent_reps: number;
          status: string; ends_at: string; created_at: string;
        };
        Insert: {
          id?: string; creator_id: string; opponent_id: string;
          title: string; goal_reps: number;
          creator_reps?: number; opponent_reps?: number;
          status?: string; ends_at: string; created_at?: string;
        };
        Update: {
          id?: string; creator_id?: string; opponent_id?: string;
          title?: string; goal_reps?: number;
          creator_reps?: number; opponent_reps?: number;
          status?: string; ends_at?: string; created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      verify_workout: { Args: { session_id: string }; Returns: void };
      update_streak: { Args: { uid: string }; Returns: void };
    };
    Enums: { [_ in never]: never };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type WorkoutSession = Database["public"]["Tables"]["workout_sessions"]["Row"];
export type Like = Database["public"]["Tables"]["likes"]["Row"];
export type Follow = Database["public"]["Tables"]["follows"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type Challenge = Database["public"]["Tables"]["challenges"]["Row"];

export type PostWithProfile = Post & { profiles: Profile; liked_by_user?: boolean };
export type NotificationWithActor = Notification & { actor: Profile; post?: Post | null };
export type ChallengeWithProfiles = Challenge & { creator: Profile; opponent: Profile };

// Achievement system
export type Achievement = {
  id: string; label: string; emoji: string;
  color: string; condition: (p: Profile) => boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_workout", label: "初陣", emoji: "🔰", color: "#22c55e", condition: (p) => p.total_workouts >= 1 },
  { id: "streak_7", label: "7日連続", emoji: "🔥", color: "#f97316", condition: (p) => p.longest_streak >= 7 },
  { id: "streak_30", label: "30日連続", emoji: "💎", color: "#06b6d4", condition: (p) => p.longest_streak >= 30 },
  { id: "streak_100", label: "100日連続", emoji: "👑", color: "#fbbf24", condition: (p) => p.longest_streak >= 100 },
  { id: "reps_1000", label: "1000rep達成", emoji: "💪", color: "#8b5cf6", condition: (p) => p.total_reps >= 1000 },
  { id: "reps_10000", label: "10000rep達成", emoji: "🚀", color: "#ef4444", condition: (p) => p.total_reps >= 10000 },
  { id: "workouts_50", label: "50回トレーニング", emoji: "🏋️", color: "#ec4899", condition: (p) => p.total_workouts >= 50 },
];

export function getTitle(p: Profile): string {
  if (p.longest_streak >= 100) return "アイアンレジェンド";
  if (p.longest_streak >= 30) return "ダイヤモンドアスリート";
  if (p.longest_streak >= 7) return "フレイムファイター";
  if (p.total_workouts >= 1) return "トレーニーデビュー";
  return "未トレーニング";
}
