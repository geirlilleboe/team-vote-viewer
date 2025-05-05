
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import TeamVotes from "@/components/TeamVotes";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { VotingSession, Vote } from "@/types/supabase";

// Team types for clarity - these are just for local use
type Team = "team1" | "team2";
type VoteType = "yes" | "no" | null;

const VotingPage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  // Session data
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState("Do you agree with the proposal?");
  
  // Which team the user has selected
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  // Unique ID for this user (generated for this session)
  const [userId, setUserId] = useState("");
  
  // All votes from both teams
  const [votes, setVotes] = useState<Vote[]>([]);
  
  // Current user's vote
  const [myVote, setMyVote] = useState<VoteType>(null);
  
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
    const savedTeam = localStorage.getItem("selectedTeam");
    if (savedTeam) {
      setSelectedTeam(savedTeam as Team);
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
    
    // Set up real-time subscription
    const votesChannel = supabase
      .channel('public:votes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votes' }, 
        () => {
          if (sessionId) {
            fetchVotes(sessionId);
          }
        }
      )
      .subscribe();
      
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
      supabase.removeChannel(votesChannel);
      supabase.removeChannel(sessionsChannel);
    };
  }, [code]);
  
  // Fetch votes when sessionId changes
  useEffect(() => {
    if (sessionId) {
      fetchVotes(sessionId);
      
      // Check for user's vote
      if (selectedTeam && userId) {
        checkUserVote(sessionId);
      }
    }
  }, [sessionId, selectedTeam, userId]);
  
  // Timer countdown effect
  useEffect(() => {
    if (!votingActive || timeRemaining === null || !sessionId) return;
    
    const timerInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timerInterval);
          updateSessionStatus(sessionId, false, true);
          toast({
            title: "Voting has ended",
            description: "Results are now visible to everyone"
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [votingActive, timeRemaining, sessionId]);
  
  // Fetch all votes for this session
  const fetchVotes = async (sessionId: string) => {
    const { data, error } = await supabase
      .from("votes")
      .select("*")
      .eq("session_id", sessionId);
    
    if (error) {
      console.error("Error fetching votes:", error);
      return;
    }
    
    // Ensure the vote data conforms to our Vote type
    const typedVotes = data.map(vote => ({
      ...vote,
      vote: vote.vote as "yes" | "no" // Type assertion for safety
    }));
    
    setVotes(typedVotes);
  };
  
  // Check if the user has already voted
  const checkUserVote = async (sessionId: string) => {
    if (!userId || !selectedTeam) return;
    
    const { data, error } = await supabase
      .from("votes")
      .select("*")
      .eq("session_id", sessionId)
      .eq("user_id", userId)
      .maybeSingle();
    
    if (error) {
      console.error("Error checking user vote:", error);
      return;
    }
    
    if (data) {
      setMyVote(data.vote as VoteType);
      setSelectedTeam(data.team as Team);
    }
  };
  
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
      setTimeRemaining(15);
      toast({
        title: "Voting has started",
        description: "You have 15 seconds to cast your vote"
      });
    }
  };
  
  // Handle team selection
  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    localStorage.setItem("selectedTeam", team);
  };
  
  // Handle voting
  const handleVote = async (vote: VoteType) => {
    if (!sessionId || !selectedTeam || !userId || !votingActive || vote === null) return;
    
    // Check if user already voted
    const { data: existingVote } = await supabase
      .from("votes")
      .select("*")
      .eq("session_id", sessionId)
      .eq("user_id", userId)
      .maybeSingle();
    
    if (existingVote) {
      // Update existing vote
      const { error } = await supabase
        .from("votes")
        .update({ vote, team: selectedTeam })
        .eq("id", existingVote.id);
      
      if (error) {
        console.error("Error updating vote:", error);
        toast({
          title: "Error",
          description: "Could not update your vote",
          variant: "destructive"
        });
        return;
      }
    } else {
      // Create new vote
      const { error } = await supabase
        .from("votes")
        .insert([{
          session_id: sessionId,
          user_id: userId,
          team: selectedTeam,
          vote
        }]);
      
      if (error) {
        console.error("Error recording vote:", error);
        toast({
          title: "Error",
          description: "Could not record your vote",
          variant: "destructive"
        });
        return;
      }
    }
    
    setMyVote(vote);
    
    toast({
      title: "Vote recorded",
      description: `You voted: ${vote}`
    });
  };
  
  // Start a new voting session
  const startVoting = () => {
    if (!sessionId) return;
    
    updateSessionStatus(sessionId, true, false);
  };
  
  // Reset all votes (admin function)
  const resetVotes = async () => {
    if (!sessionId) return;
    
    // Update session status
    await updateSessionStatus(sessionId, false, false);
    
    // Delete all votes for this session
    const { error } = await supabase
      .from("votes")
      .delete()
      .eq("session_id", sessionId);
    
    if (error) {
      console.error("Error resetting votes:", error);
      toast({
        title: "Error",
        description: "Could not reset votes",
        variant: "destructive"
      });
      return;
    }
    
    setVotes([]);
    setMyVote(null);
    setTimeRemaining(null);
    
    toast({
      title: "Votes reset",
      description: "All votes have been cleared"
    });
  };
  
  // Go back to the code entry page
  const handleBack = () => {
    navigate("/");
  };
  
  // Filter votes by team
  const teamVotes = {
    team1: votes.filter(v => v.team === "team1"),
    team2: votes.filter(v => v.team === "team2")
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading session...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with question and controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold">{question}</h1>
            
            <div className="flex gap-2">
              {!votingActive && timeRemaining === null && (
                <Button variant="default" onClick={startVoting}>
                  Start Voting (15s)
                </Button>
              )}
              <Button variant="outline" onClick={handleBack}>
                Change Code
              </Button>
              <Button variant="destructive" onClick={resetVotes}>
                Reset Votes
              </Button>
            </div>
          </div>
          
          {/* Show timer when voting is active */}
          {votingActive && timeRemaining !== null && (
            <div className="mt-4 p-3 bg-blue-100 rounded-md text-center">
              <p className="text-lg font-semibold">
                Time remaining: <span className="text-xl">{timeRemaining}</span> seconds
              </p>
              <p className="text-sm text-gray-600">
                Results will be shown when the timer ends
              </p>
            </div>
          )}
          
          {/* Show message when voting has ended */}
          {!votingActive && showResults && (
            <div className="mt-4 p-3 bg-green-100 rounded-md text-center">
              <p className="text-lg font-semibold">
                Voting has ended
              </p>
              <p className="text-sm text-gray-600">
                Results are now visible below
              </p>
            </div>
          )}
        </div>
        
        {/* Team selection if not selected */}
        {!selectedTeam && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Select your team:</h2>
            <div className="flex gap-4">
              <Button 
                className="flex-1 h-20 text-lg bg-blue-500 hover:bg-blue-600" 
                onClick={() => handleTeamSelect("team1")}
              >
                Team 1
              </Button>
              <Button 
                className="flex-1 h-20 text-lg bg-red-500 hover:bg-red-600" 
                onClick={() => handleTeamSelect("team2")}
              >
                Team 2
              </Button>
            </div>
          </div>
        )}
        
        {/* Voting controls if team is selected */}
        {selectedTeam && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Your Team: {selectedTeam === "team1" ? "Team 1" : "Team 2"}
            </h2>
            <p className="mb-4">
              {votingActive 
                ? "Cast your vote:" 
                : showResults 
                  ? "Voting has ended. Results are shown below." 
                  : "Waiting for voting to start..."}
            </p>
            
            <ToggleGroup 
              type="single" 
              value={myVote || ""} 
              onValueChange={(v) => handleVote(v as VoteType)}
              disabled={!votingActive}
            >
              <ToggleGroupItem 
                value="yes" 
                className="flex-1 text-lg py-6" 
                aria-label="Yes"
                disabled={!votingActive}
              >
                👍 Yes
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="no" 
                className="flex-1 text-lg py-6" 
                aria-label="No"
                disabled={!votingActive}
              >
                👎 No
              </ToggleGroupItem>
            </ToggleGroup>
            
            {/* Show personal vote if voted */}
            {myVote && (
              <div className="mt-4 text-center">
                <p>Your vote: <span className="font-semibold">{myVote === "yes" ? "👍 Yes" : "👎 No"}</span></p>
              </div>
            )}
          </div>
        )}
        
        {/* Display votes for both teams only when results are shown */}
        {showResults && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TeamVotes 
              team="team1" 
              teamName="Team 1" 
              votes={teamVotes.team1} 
              color="blue"
            />
            <TeamVotes 
              team="team2" 
              teamName="Team 2" 
              votes={teamVotes.team2} 
              color="red"
            />
          </div>
        )}
        
        {/* Message when results are hidden */}
        {!showResults && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Results are hidden</h2>
            <p className="text-gray-600">
              {votingActive 
                ? "Results will be visible to everyone when the voting period ends."
                : "Start voting to see results at the end of the voting period."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VotingPage;
