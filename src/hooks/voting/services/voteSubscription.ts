
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Set up real-time subscription for votes
 */
export const subscribeToVotes = (
  sessionId: string,
  onVotesChange: () => void
): RealtimeChannel => {
  const votesChannel = supabase
    .channel('public:votes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'votes' }, 
      (payload) => {
        if (sessionId) {
          onVotesChange();
        }
      }
    )
    .subscribe();
    
  return votesChannel;
};
