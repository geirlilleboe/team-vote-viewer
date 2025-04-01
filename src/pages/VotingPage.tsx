
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import TeamVotes from "@/components/TeamVotes";
import { toast } from "@/hooks/use-toast";

// Team types for clarity
type Team = "team1" | "team2";
type Vote = "yes" | "no" | null;

// Initialize team votes with local storage if available
const getInitialVotes = () => {
  if (typeof window === "undefined") return { team1: {}, team2: {} };
  
  try {
    const saved = localStorage.getItem("teamVotes");
    return saved ? JSON.parse(saved) : { team1: {}, team2: {} };
  } catch (e) {
    console.error("Error loading votes from localStorage", e);
    return { team1: {}, team2: {} };
  }
};

const VotingPage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  // State for the current question
  const [question, setQuestion] = useState("Do you agree with the proposal?");
  
  // Which team the user has selected
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  // Unique ID for this user (generated for this session)
  const [userId, setUserId] = useState("");
  
  // All votes from both teams
  const [teamVotes, setTeamVotes] = useState(getInitialVotes());
  
  // Current user's vote
  const [myVote, setMyVote] = useState<Vote>(null);
  
  // Timer for voting period
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  // State to control if results are visible
  const [showResults, setShowResults] = useState(false);
  
  // State to track if voting period is active
  const [votingActive, setVotingActive] = useState(false);
  
  // Set up the user ID on first load
  useEffect(() => {
    // Generate a random ID for this user
    const randomId = Math.random().toString(36).substring(2, 10);
    setUserId(randomId);
    
    // Attempt to load team selection from localStorage
    const savedTeam = localStorage.getItem("selectedTeam");
    if (savedTeam) {
      setSelectedTeam(savedTeam as Team);
    }
    
    // Load existing vote if we have one
    const votes = getInitialVotes();
    if (savedTeam && votes[savedTeam][randomId]) {
      setMyVote(votes[savedTeam][randomId]);
    }
    
    // Check if we need to show results based on localStorage
    const resultsVisible = localStorage.getItem("showResults") === "true";
    setShowResults(resultsVisible);
    
    // Check if there's an active timer in localStorage
    const storedEndTime = localStorage.getItem("votingEndTime");
    if (storedEndTime) {
      const endTime = parseInt(storedEndTime, 10);
      const now = Date.now();
      
      if (endTime > now) {
        // Voting is still active
        setVotingActive(true);
        setTimeRemaining(Math.ceil((endTime - now) / 1000));
        setShowResults(false);
      } else {
        // Voting has ended
        setVotingActive(false);
        setShowResults(true);
        localStorage.setItem("showResults", "true");
      }
    }
  }, []);
  
  // Save votes to localStorage when they change
  useEffect(() => {
    localStorage.setItem("teamVotes", JSON.stringify(teamVotes));
  }, [teamVotes]);
  
  // Save team selection to localStorage
  useEffect(() => {
    if (selectedTeam) {
      localStorage.setItem("selectedTeam", selectedTeam);
    }
  }, [selectedTeam]);
  
  // Timer countdown effect
  useEffect(() => {
    if (!votingActive || timeRemaining === null) return;
    
    const timerInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timerInterval);
          setVotingActive(false);
          setShowResults(true);
          localStorage.setItem("showResults", "true");
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
  }, [votingActive, timeRemaining]);
  
  // Handle team selection
  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
  };
  
  // Handle voting
  const handleVote = (vote: Vote) => {
    if (!selectedTeam || !userId || !votingActive) return;
    
    // Update the vote in the teams object
    setTeamVotes(prev => ({
      ...prev,
      [selectedTeam]: {
        ...prev[selectedTeam],
        [userId]: vote
      }
    }));
    
    setMyVote(vote);
    
    // Show notification
    toast({
      title: "Vote recorded",
      description: `You voted: ${vote}`
    });
  };
  
  // Start a new voting session
  const startVoting = () => {
    // Set 15-second timer
    const votingDuration = 15 * 1000; // 15 seconds
    const endTime = Date.now() + votingDuration;
    
    localStorage.setItem("votingEndTime", endTime.toString());
    localStorage.setItem("showResults", "false");
    
    setTimeRemaining(15);
    setVotingActive(true);
    setShowResults(false);
    
    toast({
      title: "Voting has started",
      description: "You have 15 seconds to cast your vote"
    });
  };
  
  // Reset all votes (admin function)
  const resetVotes = () => {
    setTeamVotes({ team1: {}, team2: {} });
    setMyVote(null);
    setShowResults(false);
    setVotingActive(false);
    setTimeRemaining(null);
    
    localStorage.removeItem("teamVotes");
    localStorage.removeItem("votingEndTime");
    localStorage.removeItem("showResults");
    
    toast({
      title: "Votes reset",
      description: "All votes have been cleared"
    });
  };
  
  // Go back to the code entry page
  const handleBack = () => {
    navigate("/");
  };
  
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
              onValueChange={(v) => handleVote(v as Vote)}
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
