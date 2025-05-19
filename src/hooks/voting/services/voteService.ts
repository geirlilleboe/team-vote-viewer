
import { supabase } from "@/integrations/supabase/client";
import type { Vote } from "@/types/supabase";
import { toast } from "@/hooks/use-toast";

/**
 * Fetch all votes for a specific session
 */
export const fetchVotes = async (sessionId: string): Promise<Vote[]> => {
  if (!sessionId) return [];
  
  const { data, error } = await supabase
    .from("votes")
    .select("*")
    .eq("session_id", sessionId);
  
  if (error) {
    console.error("Error fetching votes:", error);
    return [];
  }
  
  return data as Vote[];
};

/**
 * Check if a user has already voted in this session
 */
export const checkUserVote = async (sessionId: string, userId: string) => {
  if (!sessionId || !userId) return null;
  
  const { data, error } = await supabase
    .from("votes")
    .select("*")
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();
  
  if (error) {
    console.error("Error checking user vote:", error);
    return null;
  }
  
  return data ? data.vote : null;
};

/**
 * Save user vote (create or update)
 */
export const saveVote = async (
  sessionId: string, 
  userId: string, 
  team: string, 
  vote: string
): Promise<boolean> => {
  if (!sessionId || !team || !userId || !vote) return false;
  
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
      .update({ vote, team })
      .eq("id", existingVote.id)
      .eq("session_id", sessionId); 
    
    if (error) {
      console.error("Error updating vote:", error);
      toast({
        title: "Error",
        description: "Could not update your vote",
        variant: "destructive"
      });
      return false;
    }
  } else {
    // Create new vote for this session
    const { error } = await supabase
      .from("votes")
      .insert([{
        session_id: sessionId,
        user_id: userId,
        team,
        vote
      }]);
    
    if (error) {
      console.error("Error recording vote:", error);
      toast({
        title: "Error",
        description: "Could not record your vote",
        variant: "destructive"
      });
      return false;
    }
  }
  
  return true;
};

/**
 * Delete all votes for a specific session
 */
export const resetSessionVotes = async (sessionId: string): Promise<boolean> => {
  if (!sessionId) {
    console.error("Cannot reset votes: No session ID provided");
    return false;
  }
  
  try {
    console.log("Starting votes reset for session:", sessionId);
    
    // Delete all votes for this specific session from the database
    const { error: deleteError } = await supabase
      .from("votes")
      .delete()
      .eq("session_id", sessionId);
    
    if (deleteError) {
      console.error("Error resetting votes:", deleteError);
      return false;
    }
    
    // Verify deletion success
    const { data: remainingVotes, error: countError } = await supabase
      .from("votes")
      .select("*")
      .eq("session_id", sessionId);
    
    if (countError) {
      console.error("Error verifying vote deletion:", countError);
      return false;
    } else if (remainingVotes && remainingVotes.length > 0) {
      console.error(`WARNING: ${remainingVotes.length} votes were not deleted!`);
      return false;
    }
    
    console.log("Verified: All votes successfully deleted from database");
    return true;
    
  } catch (err) {
    console.error("Exception during vote reset:", err);
    return false;
  }
};
