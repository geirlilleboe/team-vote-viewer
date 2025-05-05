
export type VotingSession = {
  id: string;
  code: string;
  question: string;
  voting_active: boolean;
  show_results: boolean;
  end_time: string | null;
  created_at: string;
};

export type Vote = {
  id: string;
  session_id: string;
  team: string; // Change from "team1" | "team2" to string to match what comes from the database
  user_id: string;
  vote: string; // Change from "yes" | "no" to string to match what comes from the database
  created_at: string;
};
