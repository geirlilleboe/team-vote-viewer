
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface UseTimerManagementProps {
  votingActive: boolean;
  timeRemaining: number | null;
  sessionId: string | null;
  updateSessionStatus: (sessionId: string, active: boolean, showResults: boolean) => void;
}

export const useTimerManagement = ({
  votingActive,
  timeRemaining,
  sessionId,
  updateSessionStatus,
}: UseTimerManagementProps) => {
  // Timer countdown effect
  useEffect(() => {
    if (!votingActive || timeRemaining === null || !sessionId) return;
    
    const timerInterval = setInterval(() => {
      updateTimeRemaining(sessionId, updateSessionStatus);
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [votingActive, timeRemaining, sessionId, updateSessionStatus]);
  
  const updateTimeRemaining = (
    sessionId: string,
    updateSessionStatus: (sessionId: string, active: boolean, showResults: boolean) => void
  ) => {
    if (timeRemaining === null) return;
    
    if (timeRemaining <= 1) {
      updateSessionStatus(sessionId, false, true);
      toast({
        title: "Voting has ended",
        description: "Results are now visible to everyone"
      });
      return;
    }
  };
};
