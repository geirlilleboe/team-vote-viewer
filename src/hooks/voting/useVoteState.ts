
import { useState, useEffect } from "react";
import { fetchVotes, checkUserVote } from "./services/voteService";
import type { Vote } from "@/types/supabase";
import type { Team, VoteType, TeamVotes } from "./types";

/**
 * Hook to manage vote state
 */
export const useVoteState = (
  sessionId: string | null,
  userId: string, 
  selectedTeam: Team | null
) => {
  // All votes from both teams
  const [votes, setVotes] = useState<Vote[]>([]);
  
  // Current user's vote
  const [myVote, setMyVote] = useState<VoteType>(null);
  
  // Fetch votes initially and set up subscription
  useEffect(() => {
    if (!sessionId) return;
    
    const loadVotes = async () => {
      const fetchedVotes = await fetchVotes(sessionId);
      setVotes(fetchedVotes);
    };
    
    loadVotes();
  }, [sessionId]);
  
  // Check for user's vote when sessionId or userId changes
  useEffect(() => {
    if (sessionId && userId) {
      const loadUserVote = async () => {
        const vote = await checkUserVote(sessionId, userId);
        setMyVote(vote as VoteType);
      };
      
      loadUserVote();
    } else {
      setMyVote(null);
    }
  }, [sessionId, userId]);
  
  // Compute team votes
  const teamVotes: TeamVotes = {
    team1: votes.filter(v => v.team === "team1"),
    team2: votes.filter(v => v.team === "team2")
  };
  
  // Clear all vote state
  const clearVoteState = () => {
    setVotes([]);
    setMyVote(null);
  };
  
  return {
    votes,
    setVotes,
    myVote,
    setMyVote,
    teamVotes,
    clearVoteState
  };
};
