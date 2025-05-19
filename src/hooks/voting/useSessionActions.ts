
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { updateSessionStatus, createSession, deleteSession } from "./services/sessionService";
import type { Team } from "./types";

interface UseSessionActionsProps {
  sessionId: string | null;
  selectedTeam: Team | null;
  setSelectedTeam: (team: Team) => void;
  setVotingActive: (active: boolean) => void;
  setShowResults: (show: boolean) => void;
  setTimeRemaining: (time: number | null) => void;
}

interface UseSessionActionsResult {
  updateSessionStatus: (active: boolean, showResults: boolean) => Promise<void>;
  createNewSession: () => Promise<void>;
  handleBack: () => void;
}

export const useSessionActions = ({
  sessionId,
  selectedTeam,
  setSelectedTeam,
  setVotingActive,
  setShowResults,
  setTimeRemaining
}: UseSessionActionsProps): UseSessionActionsResult => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Update session status (active/results)
  const handleUpdateSessionStatus = async (active: boolean, showResults: boolean) => {
    if (!sessionId) return;
    
    let endTime: string | undefined;
    
    if (active) {
      // Set end time 15 seconds in the future
      endTime = new Date(Date.now() + 15 * 1000).toISOString();
      
      // Set initial time remaining
      setTimeRemaining(15);
    } else {
      // Reset timer when voting is not active
      if (!showResults) {
        setTimeRemaining(null);
      }
    }
    
    const success = await updateSessionStatus(sessionId, active, showResults, endTime);
    
    if (success) {
      setVotingActive(active);
      setShowResults(showResults);
      
      if (active) {
        toast({
          title: "Voting has started",
          description: "You have 15 seconds to cast your vote"
        });
      }
    }
  };
  
  // Create a completely new session with the same code
  const handleCreateNewSession = async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    
    try {
      const code = window.location.pathname.split("/")[2]; // Extract code from URL
      if (!code) {
        toast({
          title: "Error",
          description: "Could not determine session code",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      console.log("Creating a new session with code:", code);
      
      // Step 1: Delete the current session and its votes
      const deleteSuccess = await deleteSession(sessionId);
        
      if (!deleteSuccess) {
        toast({
          title: "Error",
          description: "Could not create new session",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Step 2: Create a new session with the same code
      const newSession = await createSession(code);
      
      if (!newSession) {
        toast({
          title: "Error",
          description: "Could not create new session",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Step 3: Update local state with the new session
      setVotingActive(false);
      setShowResults(false);
      setTimeRemaining(null);
      
      // Generate a new user ID for this session
      const randomId = Math.random().toString(36).substring(2, 10) + Date.now().toString();
      
      toast({
        title: "New voting session created",
        description: "All previous votes have been cleared"
      });
      
    } catch (err) {
      console.error("Exception during session creation:", err);
      toast({
        title: "Error",
        description: "Could not create new session",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Go back to the code entry page
  const handleBack = () => {
    navigate("/");
  };
  
  return {
    updateSessionStatus: handleUpdateSessionStatus,
    createNewSession: handleCreateNewSession,
    handleBack
  };
};
