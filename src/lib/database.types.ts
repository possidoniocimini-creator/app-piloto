export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          onboarding_completed: boolean;
          onboarding_step: number;
          cycle_start_date: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      onboarding_answers: {
        Row: {
          id: string;
          user_id: string;
          session_number: number;
          question_key: string;
          answer: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["onboarding_answers"]["Row"]> & {
          user_id: string;
          session_number: number;
          question_key: string;
          answer: string;
        };
        Update: Partial<Database["public"]["Tables"]["onboarding_answers"]["Row"]>;
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          weekdays: number[];
          active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["habits"]["Row"]> & {
          user_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["habits"]["Row"]>;
      };
      checklist_entries: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string;
          entry_date: string;
          completed: boolean;
          completed_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["checklist_entries"]["Row"]> & {
          user_id: string;
          habit_id: string;
          entry_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["checklist_entries"]["Row"]>;
      };
      lessons: {
        Row: {
          id: string;
          slug: string;
          title: string;
          category: string;
          summary: string;
          content: string;
          order_index: number;
        };
        Insert: Partial<Database["public"]["Tables"]["lessons"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["lessons"]["Row"]>;
      };
      lesson_progress: {
        Row: {
          user_id: string;
          lesson_id: string;
          completed: boolean;
          completed_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["lesson_progress"]["Row"]> & {
          user_id: string;
          lesson_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["lesson_progress"]["Row"]>;
      };
    };
    Functions: {
      get_leaderboard: {
        Args: Record<string, never>;
        Returns: {
          user_id: string;
          full_name: string;
          completed_last_30_days: number;
          current_streak_days: number;
        }[];
      };
    };
  };
};
