
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { VotingSession } from "@/types/supabase";

interface UseSessionSubscriptionProps {
  code: string | undefined;
  setVotingActive: (active: boolean) => void;
  setShowResults: (show: boolean) => void;
  setTimeRemaining: (time: number | null) => void;
}

export const useSessionSubscription = ({
  code,
  setVotingActive,
  setShowResults,
  setTimeRemaining,
}: UseSessionSubscriptionProps) => {
  // Subscribe to session changes
  useEffect(() => {
    if (!code) return;
    
    const sessionsChannel = supabase
      .channel('public:voting_sessions')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'voting_sessions' }, 
        (payload) => {
          const session = payload.new as VotingSession;
          if (session.code === code) {
            setVotingActive(session.voting_active);
            setShowResults(session.show_results);
            
            if (session.voting_active && session.end_time) {
              const endTime = new Date(session.end_time).getTime();
              const now = Date.now();
              
              if (endTime > now) {
                setTimeRemaining(Math.ceil((endTime - now) / 1000));
              }
            }
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(sessionsChannel);
    };
  }, [code, setVotingActive, setShowResults, setTimeRemaining]);
};
