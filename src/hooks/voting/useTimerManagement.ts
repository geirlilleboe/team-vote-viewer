
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface UseTimerManagementProps {
  votingActive: boolean;
  timeRemaining: number | null;
  sessionId: string | null;
  updateSessionStatus: (sessionId: string, active: boolean, showResults: boolean) => void;
  setTimeRemaining: (time: number | null) => void;
}

export const useTimerManagement = ({
  votingActive,
  timeRemaining,
  sessionId,
  updateSessionStatus,
  setTimeRemaining,
}: UseTimerManagementProps) => {
  // Timer countdown effect
  useEffect(() => {
    if (!votingActive || timeRemaining === null || !sessionId) return;
    
    const timerInterval = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime === null) return null;
        if (prevTime <= 1) {
          // When timer ends, update session status
          updateSessionStatus(sessionId, false, true);
          toast({
            title: "Voting has ended",
            description: "Results are now visible to everyone"
          });
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [votingActive, sessionId, updateSessionStatus, setTimeRemaining]);
};
