
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { VotingSession } from "@/types/supabase";

/**
 * Fetch session by code
 */
export const fetchSessionByCode = async (code: string): Promise<VotingSession | null> => {
  const { data: existingSession, error: fetchError } = await supabase
    .from("voting_sessions")
    .select("*")
    .eq("code", code)
    .single();
  
  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error fetching session:", fetchError);
    toast({
      title: "Error",
      description: "Could not fetch voting session",
      variant: "destructive"
    });
    return null;
  }
  
  return existingSession || null;
};

/**
 * Create a new session with given code
 */
export const createSession = async (code: string): Promise<VotingSession | null> => {
  const { data: newSession, error: createError } = await supabase
    .from("voting_sessions")
    .insert([{ code }])
    .select()
    .single();
  
  if (createError) {
    console.error("Error creating session:", createError);
    toast({
      title: "Error",
      description: "Could not create voting session",
      variant: "destructive"
    });
    return null;
  }
  
  return newSession;
};

/**
 * Update session status
 */
export const updateSessionStatus = async (
  sessionId: string, 
  active: boolean, 
  showResults: boolean,
  endTime?: string | null
): Promise<boolean> => {
  const updateData: any = {
    voting_active: active,
    show_results: showResults,
  };
  
  if (endTime) {
    updateData.end_time = endTime;
  }
  
  const { error } = await supabase
    .from("voting_sessions")
    .update(updateData)
    .eq("id", sessionId);
  
  if (error) {
    console.error("Error updating session:", error);
    toast({
      title: "Error",
      description: "Could not update voting status",
      variant: "destructive"
    });
    return false;
  }
  
  return true;
};

/**
 * Delete a session and its votes
 */
export const deleteSession = async (sessionId: string): Promise<boolean> => {
  try {
    // Step 1: Delete all votes for the session
    const { error: deleteVotesError } = await supabase
      .from("votes")
      .delete()
      .eq("session_id", sessionId);
      
    if (deleteVotesError) {
      console.error("Error deleting votes:", deleteVotesError);
      return false;
    }
    
    // Step 2: Delete the session
    const { error: deleteSessionError } = await supabase
      .from("voting_sessions")
      .delete()
      .eq("id", sessionId);
      
    if (deleteSessionError) {
      console.error("Error deleting session:", deleteSessionError);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Exception during session deletion:", err);
    return false;
  }
};
