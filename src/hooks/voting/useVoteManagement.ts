
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Vote } from "@/types/supabase";
import type { Team, VoteType, TeamVotes } from "./types";

export const useVoteManagement = (
  sessionId: string | null, 
  selectedTeam: Team | null, 
  userId: string,
  votingActive: boolean
) => {
  // All votes from both teams
  const [votes, setVotes] = useState<Vote[]>([]);
  
  // Current user's vote
  const [myVote, setMyVote] = useState<VoteType>(null);
  
  // Subscribe to votes changes
  useEffect(() => {
    if (!sessionId) return;
    
    // Set up real-time subscription for votes
    const votesChannel = supabase
      .channel('public:votes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votes' }, 
        () => {
          if (sessionId) {
            fetchVotes(sessionId);
          }
        }
      )
      .subscribe();
    
    // Initial fetch of votes
    fetchVotes(sessionId);
    
    // Clean up subscription and reset state when sessionId changes
    return () => {
      supabase.removeChannel(votesChannel);
      setVotes([]);
      setMyVote(null);
    };
  }, [sessionId]);
  
  // Check for user's vote when sessionId or team changes
  useEffect(() => {
    if (sessionId && selectedTeam && userId) {
      checkUserVote(sessionId, userId);
    } else {
      // If no sessionId, team, or userId, reset myVote
      setMyVote(null);
    }
  }, [sessionId, selectedTeam, userId]);
  
  // Fetch all votes for this session
  const fetchVotes = async (sessionId: string) => {
    if (!sessionId) return;
    
    const { data, error } = await supabase
      .from("votes")
      .select("*")
      .eq("session_id", sessionId);
    
    if (error) {
      console.error("Error fetching votes:", error);
      return;
    }
    
    setVotes(data as Vote[]);
  };
  
  // Check if the user has already voted
  const checkUserVote = async (sessionId: string, userId: string) => {
    if (!sessionId || !userId) return;
    
    const { data, error } = await supabase
      .from("votes")
      .select("*")
      .eq("session_id", sessionId)
      .eq("user_id", userId)
      .maybeSingle();
    
    if (error) {
      console.error("Error checking user vote:", error);
      return;
    }
    
    if (data) {
      setMyVote(data.vote as VoteType);
    } else {
      // User hasn't voted yet in this session
      setMyVote(null);
    }
  };
  
  // Handle voting
  const handleVote = async (vote: VoteType) => {
    if (!sessionId || !selectedTeam || !userId || !votingActive || vote === null) return;
    
    // Check if user already voted in this specific session
    const { data: existingVote } = await supabase
      .from("votes")
      .select("*")
      .eq("session_id", sessionId)
      .eq("user_id", userId)
      .maybeSingle();
    
    if (existingVote) {
      // Update existing vote for this session
      const { error } = await supabase
        .from("votes")
        .update({ vote, team: selectedTeam })
        .eq("id", existingVote.id)
        .eq("session_id", sessionId); // Extra check to ensure we're updating votes for this session
      
      if (error) {
        console.error("Error updating vote:", error);
        toast({
          title: "Error",
          description: "Could not update your vote",
          variant: "destructive"
        });
        return;
      }
    } else {
      // Create new vote for this session
      const { error } = await supabase
        .from("votes")
        .insert([{
          session_id: sessionId,
          user_id: userId,
          team: selectedTeam,
          vote
        }]);
      
      if (error) {
        console.error("Error recording vote:", error);
        toast({
          title: "Error",
          description: "Could not record your vote",
          variant: "destructive"
        });
        return;
      }
    }
    
    // Update local state after successful database operation
    setMyVote(vote);
    
    toast({
      title: "Vote recorded",
      description: `You voted: ${vote}`
    });
    
    // Refresh votes to ensure we have the latest data
    fetchVotes(sessionId);
  };
  
  // Enhanced reset votes function with better verification and state management
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
    
    try {
      console.log("Starting votes reset for session:", sessionId);
      
      // Step 1: First clear local state to prevent stale UI
      setVotes([]);
      setMyVote(null);
      
      // Step 2: Delete all votes for this specific session from the database
      const { error: deleteError } = await supabase
        .from("votes")
        .delete()
        .eq("session_id", sessionId);
      
      if (deleteError) {
        console.error("Error resetting votes:", deleteError);
        toast({
          title: "Error",
          description: "Failed to reset votes in database",
          variant: "destructive"
        });
        
        // If deletion failed, refresh votes to ensure UI is consistent
        await fetchVotes(sessionId);
        return;
      }
      
      // Step 3: Double check our database delete was successful by querying again
      const { data: remainingVotes, error: countError } = await supabase
        .from("votes")
        .select("*")
        .eq("session_id", sessionId);
      
      if (countError) {
        console.error("Error verifying vote deletion:", countError);
      } else if (remainingVotes && remainingVotes.length > 0) {
        // Some votes still exist - this should not happen
        console.error(`WARNING: ${remainingVotes.length} votes were not deleted!`);
        
        // Force local state to be empty anyway
        setVotes([]);
        setMyVote(null);
      } else {
        console.log("Verified: All votes successfully deleted from database");
      }
      
      toast({
        title: "Votes reset",
        description: "All votes have been cleared"
      });
    } catch (err) {
      console.error("Exception during vote reset:", err);
      toast({
        title: "Error",
        description: "Could not reset votes due to an exception",
        variant: "destructive"
      });
      
      // Refresh votes to ensure UI is consistent with database
      await fetchVotes(sessionId);
    }
  };

  // Filter votes by team
  const teamVotes: TeamVotes = {
    team1: votes.filter(v => v.team === "team1"),
    team2: votes.filter(v => v.team === "team2")
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
