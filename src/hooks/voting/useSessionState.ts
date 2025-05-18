
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { VotingSession } from "@/types/supabase";
import type { Team } from "./types";

export const useSessionState = (initialTeam?: Team) => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  // Session data
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState("Do you agree with the proposal?");
  
  // Which team the user has selected
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(initialTeam || null);
  
  // Unique ID for this user (generated for this session)
  const [userId, setUserId] = useState("");
  
  // Timer for voting period
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  // State to control if results are visible
  const [showResults, setShowResults] = useState(false);
  
  // State to track if voting period is active
  const [votingActive, setVotingActive] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize or fetch voting session
  useEffect(() => {
    if (!code) return;
    
    // Generate a random ID for this user
    const randomId = Math.random().toString(36).substring(2, 10);
    setUserId(randomId);
    
    // Try to load team from localStorage (only for UI preference)
    if (!initialTeam) {
      const savedTeam = localStorage.getItem("selectedTeam");
      if (savedTeam) {
        setSelectedTeam(savedTeam as Team);
      }
    } else {
      // If initialTeam is provided, store it in localStorage
      localStorage.setItem("selectedTeam", initialTeam);
    }
    
    const fetchOrCreateSession = async () => {
      setIsLoading(true);
      
      // Check if session exists
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
        setIsLoading(false);
        return;
      }
      
      if (existingSession) {
        // Session exists, use it
        setSessionId(existingSession.id);
        setQuestion(existingSession.question);
        setVotingActive(existingSession.voting_active);
        setShowResults(existingSession.show_results);
        
        // Set timer if voting is active
        if (existingSession.voting_active && existingSession.end_time) {
          const endTime = new Date(existingSession.end_time).getTime();
          const now = Date.now();
          
          if (endTime > now) {
            setTimeRemaining(Math.ceil((endTime - now) / 1000));
          } else {
            // Voting has ended
            updateSessionStatus(existingSession.id, false, true);
          }
        } else {
          // Reset timer if voting is not active
          setTimeRemaining(null);
        }
      } else {
        // Create new session
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
          setIsLoading(false);
          return;
        }
        
        setSessionId(newSession.id);
        setQuestion(newSession.question);
      }
      
      setIsLoading(false);
    };
    
    fetchOrCreateSession();
  }, [code, initialTeam]);

  // Update session status (active/results)
  const updateSessionStatus = async (sessionId: string, active: boolean, showResults: boolean) => {
    const updateData: any = {
      voting_active: active,
      show_results: showResults,
    };
    
    if (active) {
      // Set end time 15 seconds in the future
      const endTime = new Date(Date.now() + 15 * 1000).toISOString();
      updateData.end_time = endTime;
      
      // Set initial time remaining
      setTimeRemaining(15);
    } else {
      // Reset timer when voting is not active
      if (!showResults) {
        setTimeRemaining(null);
      }
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
      return;
    }
    
    setVotingActive(active);
    setShowResults(showResults);
    
    if (active) {
      toast({
        title: "Voting has started",
        description: "You have 15 seconds to cast your vote"
      });
    }
  };
  
  // Go back to the code entry page
  const handleBack = () => {
    navigate("/");
  };
  
  return {
    sessionId,
    question,
    selectedTeam,
    setSelectedTeam,
    userId,
    timeRemaining,
    setTimeRemaining,
    showResults,
    setShowResults,
    votingActive,
    setVotingActive,
    isLoading,
    updateSessionStatus,
    handleBack
  };
};
