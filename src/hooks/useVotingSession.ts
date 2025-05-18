
import { useParams } from "react-router-dom";
import { useSessionState } from "./voting/useSessionState";
import { useVoteManagement } from "./voting/useVoteManagement";
import { useSessionSubscription } from "./voting/useSessionSubscription";
import { useTimerManagement } from "./voting/useTimerManagement";
import type { Team, VoteType } from "./voting/types";

export const useVotingSession = (initialTeam?: Team) => {
  const { code } = useParams<{ code: string }>();
  
  // Setup session state management
  const {
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
  } = useSessionState(initialTeam);
  
  // Setup vote management
  const {
    votes,
    myVote,
    teamVotes,
    handleTeamSelect: baseHandleTeamSelect,
    handleVote,
    resetVotes
  } = useVoteManagement(sessionId, selectedTeam, userId, votingActive);
  
  // Handle team selection with state update
  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    baseHandleTeamSelect(team);
  };
  
  // Start a new voting session
  const startVoting = () => {
    if (!sessionId) return;
    updateSessionStatus(sessionId, true, false);
  };
  
  // Subscribe to session changes
  useSessionSubscription({
    code,
    setVotingActive,
    setShowResults,
    setTimeRemaining
  });
  
  // Timer management
  useTimerManagement({
    votingActive,
    timeRemaining,
    sessionId,
    updateSessionStatus,
    setTimeRemaining
  });
  
  // Return combined hook data
  return {
    question,
    selectedTeam,
    myVote,
    votes,
    teamVotes,
    votingActive,
    showResults,
    timeRemaining,
    isLoading,
    handleTeamSelect,
    handleVote,
    startVoting,
    resetVotes,
    createNewSession,
    handleBack
  };
};
