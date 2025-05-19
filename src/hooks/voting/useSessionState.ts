
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useSessionInitializer } from "./useSessionInitializer";
import { useSessionActions } from "./useSessionActions";
import type { Team } from "./types";

export const useSessionState = (initialTeam?: Team) => {
  const { code } = useParams<{ code: string }>();
  
  // Initialize session state with the initializer hook
  const {
    sessionId,
    question,
    selectedTeam: initialSelectedTeam,
    userId,
    isLoading,
    votingActive: initialVotingActive,
    showResults: initialShowResults,
    timeRemaining: initialTimeRemaining
  } = useSessionInitializer(code, initialTeam);
  
  // State management
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(initialSelectedTeam);
  const [votingActive, setVotingActive] = useState(initialVotingActive);
  const [showResults, setShowResults] = useState(initialShowResults);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(initialTimeRemaining);
  
  // Session actions hook
  const {
    updateSessionStatus: handleUpdateSessionStatus,
    createNewSession: handleCreateNewSession,
    handleBack
  } = useSessionActions({
    sessionId,
    selectedTeam,
    setSelectedTeam,
    setVotingActive,
    setShowResults,
    setTimeRemaining
  });
  
  // Exposed update session status function
  const updateSessionStatus = async (sessionId: string, active: boolean, showResults: boolean) => {
    await handleUpdateSessionStatus(active, showResults);
  };
  
  // Create a completely new session with the same code
  const createNewSession = async () => {
    await handleCreateNewSession();
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
    createNewSession,
    handleBack
  };
};
