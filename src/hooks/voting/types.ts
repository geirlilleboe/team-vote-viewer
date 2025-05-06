
import type { Vote } from "@/types/supabase";

// Types used across voting hooks
export type Team = "team1" | "team2";
export type VoteType = "yes" | "no" | null;

// Aggregated vote data by team
export interface TeamVotes {
  team1: Vote[];
  team2: Vote[];
}
