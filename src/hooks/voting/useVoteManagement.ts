
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useVoteState } from "./useVoteState";
import { fetchVotes, saveVote, resetSessionVotes } from "./services/voteService";
import { subscribeToVotes } from "./services/voteSubscription";
import type { Team, VoteType } from "./types";

export const useVoteManagement = (
  sessionId: string | null, 
  selectedTeam: Team | null, 
  userId: string,
  votingActive: boolean
) => {
  // Use our vote state hook for managing state
  const {
    votes,
    setVotes,
    myVote,
    setMyVote,
    teamVotes,
    clearVoteState
  } = useVoteState(sessionId, userId, selectedTeam);
  
  // Set up subscription to vote changes
  useEffect(() => {
    if (!sessionId) return;
    
    // Set up real-time subscription and handle initial fetch
    const votesChannel = subscribeToVotes(sessionId, () => {
      if (sessionId) {
        fetchVotes(sessionId).then(setVotes);
      }
    });
    
    // Initial fetch of votes
    fetchVotes(sessionId).then(setVotes);
    
    // Clean up subscription and reset state when sessionId changes
    return () => {
      supabase.removeChannel(votesChannel);
      clearVoteState();
    };
  }, [sessionId]);
  
  // Handle voting
  const handleVote = async (vote: VoteType) => {
    if (!sessionId || !selectedTeam || !userId || !votingActive || vote === null) return;
    
    const success = await saveVote(sessionId, userId, selectedTeam, vote);
    
    if (success) {
      // Update local state after successful database operation
      setMyVote(vote);
      
      toast({
        title: "Vote recorded",
        description: `You voted: ${vote}`
      });
      
      // Refresh votes to ensure we have the latest data
      const updatedVotes = await fetchVotes(sessionId);
      setVotes(updatedVotes);
    }
  };
  
  // Reset votes function
  const resetVotes = async () => {
    if (!sessionId) {
      console.error("Cannot reset votes: No session ID provided");
      toast({
        title: "Error",
        description: "Cannot reset votes: Invalid session",
        variant: "destructive"
      });
      return;
    }
    
    // First clear local state to prevent stale UI
    clearVoteState();
    
    // Then reset in database
    const success = await resetSessionVotes(sessionId);
    
    if (success) {
      toast({
        title: "Votes reset",
        description: "All votes have been cleared"
      });
    } else {
      toast({
        title: "Error",
        description: "Could not reset votes completely",
        variant: "destructive"
      });
      
      // If reset failed, refresh votes to ensure UI is consistent
      const currentVotes = await fetchVotes(sessionId);
      setVotes(currentVotes);
    }
  };

  // Handle team selection
  const handleTeamSelect = (team: Team) => {
    localStorage.setItem("selectedTeam", team);
  };
  
  return {
    votes,
    myVote,
    teamVotes,
    handleTeamSelect,
    handleVote,
    resetVotes
  };
};
