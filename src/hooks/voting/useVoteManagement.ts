
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
  
  // Reset all votes (admin function) - completely revamped for reliability
  const resetVotes = async () => {
    if (!sessionId) return;
    
    try {
      console.log("Resetting votes for session:", sessionId);
      
      // Step 1: Delete all votes for this specific session
      const { error } = await supabase
        .from("votes")
        .delete()
        .eq("session_id", sessionId);
      
      if (error) {
        console.error("Error resetting votes:", error);
        toast({
          title: "Error",
          description: "Could not reset votes",
          variant: "destructive"
        });
        return;
      }
      
      // Step 2: Explicitly clear local state - this is critical
      setVotes([]);
      setMyVote(null);
      
      // Step 3: Force refresh of votes from database to ensure clean state
      await fetchVotes(sessionId);
      
      // Step 4: Verify the votes are actually gone
      const { count, error: countError } = await supabase
        .from("votes")
        .select("*", { count: 'exact', head: true })
        .eq("session_id", sessionId);
      
      if (countError) {
        console.error("Error counting votes after reset:", countError);
      } else {
        console.log(`Votes after reset: ${count}`);
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
