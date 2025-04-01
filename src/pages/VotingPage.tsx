
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import TeamVotes from "@/components/TeamVotes";

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
  
  // Handle team selection
  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
  };
  
  // Handle voting
  const handleVote = (vote: Vote) => {
    if (!selectedTeam || !userId) return;
    
    // Update the vote in the teams object
    setTeamVotes(prev => ({
      ...prev,
      [selectedTeam]: {
        ...prev[selectedTeam],
        [userId]: vote
      }
    }));
    
    setMyVote(vote);
  };
  
  // Reset all votes (admin function)
  const resetVotes = () => {
    setTeamVotes({ team1: {}, team2: {} });
    setMyVote(null);
    localStorage.removeItem("teamVotes");
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
              <Button variant="outline" onClick={handleBack}>
                Change Code
              </Button>
              <Button variant="destructive" onClick={resetVotes}>
                Reset Votes
              </Button>
            </div>
          </div>
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
            <p className="mb-4">Cast your vote:</p>
            
            <ToggleGroup type="single" value={myVote || ""} onValueChange={(v) => handleVote(v as Vote)}>
              <ToggleGroupItem value="yes" className="flex-1 text-lg py-6" aria-label="Yes">
                👍 Yes
              </ToggleGroupItem>
              <ToggleGroupItem value="no" className="flex-1 text-lg py-6" aria-label="No">
                👎 No
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}
        
        {/* Display votes for both teams */}
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
      </div>
    </div>
  );
};

export default VotingPage;
