
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { fetchSessionByCode, createSession } from "./services/sessionService";
import type { Team } from "./types";

interface UseSessionInitializerResult {
  sessionId: string | null;
  question: string;
  selectedTeam: Team | null;
  userId: string;
  isLoading: boolean;
  votingActive: boolean;
  showResults: boolean;
  timeRemaining: number | null;
}

export const useSessionInitializer = (code: string | undefined, initialTeam?: Team): UseSessionInitializerResult => {
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
    
    // Generate a new random ID for this user for each session
    const randomId = Math.random().toString(36).substring(2, 10) + Date.now().toString();
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
      
      // Reset states when fetching a new session
      setVotingActive(false);
      setShowResults(false);
      setTimeRemaining(null);
      
      // Check if session exists
      const existingSession = await fetchSessionByCode(code);
      
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
          }
        } else {
          // Reset timer if voting is not active
          setTimeRemaining(null);
        }
      } else {
        // Create new session
        const newSession = await createSession(code);
        
        if (newSession) {
          setSessionId(newSession.id);
          setQuestion(newSession.question);
        }
      }
      
      setIsLoading(false);
    };
    
    fetchOrCreateSession();
    
    // Clean up function to reset state when component unmounts or code changes
    return () => {
      console.log("Cleaning up session state");
      setSessionId(null);
      setQuestion("Do you agree with the proposal?");
      setVotingActive(false);
      setShowResults(false);
      setTimeRemaining(null);
    };
  }, [code, initialTeam]);

  return {
    sessionId,
    question,
    selectedTeam,
    userId,
    isLoading,
    votingActive,
    showResults,
    timeRemaining
  };
};
