
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
    
    return () => {
      supabase.removeChannel(votesChannel);
    };
  }, [sessionId]);
  
  // Check for user's vote when sessionId or team changes
  useEffect(() => {
    if (sessionId && selectedTeam && userId) {
      checkUserVote(sessionId);
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
  const checkUserVote = async (sessionId: string) => {
    if (!userId || !selectedTeam) return;
    
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
    
    // Check if user already voted
    const { data: existingVote } = await supabase
      .from("votes")
      .select("*")
      .eq("session_id", sessionId)
      .eq("user_id", userId)
      .maybeSingle();
    
    if (existingVote) {
      // Update existing vote
      const { error } = await supabase
        .from("votes")
        .update({ vote, team: selectedTeam })
        .eq("id", existingVote.id);
      
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
      // Create new vote
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
    
    setMyVote(vote);
    
    toast({
      title: "Vote recorded",
      description: `You voted: ${vote}`
    });
  };
  
  // Reset all votes (admin function)
  const resetVotes = async () => {
    if (!sessionId) return;
    
    // Delete all votes for this session
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
    
    setVotes([]);
    setMyVote(null);
    
    toast({
      title: "Votes reset",
      description: "All votes have been cleared"
    });
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
