
import type { Vote } from "@/types/supabase";

// Types used across voting hooks
export type Team = "team1" | "team2";
export type VoteType = "yes" | "no" | null;

// Aggregated vote data by team
export interface TeamVotes {
  team1: Vote[];
  team2: Vote[];
}

// Fixed obfuscated team identifiers
export const TEAM1_HASH = "a7f9q2-dGVhbTE";
export const TEAM2_HASH = "z3x8p5-dGVhbTI";
