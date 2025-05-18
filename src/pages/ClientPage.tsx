
import { useParams } from "react-router-dom";
import TeamSelector from "@/components/voting/TeamSelector";
import VotingControls from "@/components/voting/VotingControls";
import ResultsDisplay from "@/components/voting/ResultsDisplay";
import { useVotingSession } from "@/hooks/useVotingSession";
import { TEAM1_HASH, TEAM2_HASH } from "@/hooks/voting/types";

// Function to decode team hash into actual team name using fixed identifiers
const decodeTeamHash = (hash: string): "team1" | "team2" | undefined => {
  // Use the fixed team identifiers for comparison
  if (hash === TEAM1_HASH) {
    return "team1";
  } else if (hash === TEAM2_HASH) {
    return "team2";
  } else {
    // If someone tries to use a different hash, log the attempt and return undefined
    console.error("Invalid team hash:", hash);
    return undefined;
  }
};

const ClientPage = () => {
  const { code, teamHash } = useParams<{ code: string; teamHash?: string }>();
  
  // Decode team from hash if provided
  const initialTeam = teamHash ? decodeTeamHash(teamHash) : undefined;
  
  const {
    question,
    selectedTeam,
    myVote,
    teamVotes,
    votingActive,
    showResults,
    isLoading,
    handleTeamSelect,
    handleVote
  } = useVotingSession(initialTeam);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052CC] mx-auto mb-4"></div>
          <p className="text-lg text-[#253858]">Loading session...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with question */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-[#DFE1E6]">
          <div className="flex items-center justify-center">
            {/* Bulder Bank style logo placeholder */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0065FF] to-[#0052CC] mr-3"></div>
            <h1 className="text-2xl font-bold text-[#172B4D]">{question}</h1>
          </div>
          
          {/* Show timer when voting is active */}
          {votingActive && (
            <div className="mt-4 p-4 bg-[#E6EFFC] rounded-xl">
              <p className="text-center text-lg font-medium text-[#0052CC]">
                Voting is active
              </p>
            </div>
          )}
          
          {/* Show message when voting has ended */}
          {!votingActive && showResults && (
            <div className="mt-4 p-4 bg-[#E3FCEF] rounded-xl">
              <p className="text-center text-lg font-medium text-[#006644]">
                Voting has ended
              </p>
            </div>
          )}
        </div>
        
        {/* Team selection if not already selected */}
        {!selectedTeam && (
          <TeamSelector onSelectTeam={handleTeamSelect} />
        )}
        
        {/* Voting controls if team is selected */}
        {selectedTeam && (
          <VotingControls
            teamName={selectedTeam === "team1" ? "Team 1" : "Team 2"}
            votingActive={votingActive}
            showResults={showResults}
            myVote={myVote}
            onVote={handleVote}
          />
        )}
        
        {/* Only show results if admin has enabled results */}
        <ResultsDisplay 
          showResults={showResults}
          teamVotes={teamVotes}
          isAdmin={false}
        />
      </div>
    </div>
  );
};

export default ClientPage;
