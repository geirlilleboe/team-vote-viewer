
import { useParams } from "react-router-dom";
import TeamSelector from "@/components/voting/TeamSelector";
import VotingControls from "@/components/voting/VotingControls";
import ResultsDisplay from "@/components/voting/ResultsDisplay";
import { useVotingSession } from "@/hooks/useVotingSession";

const ClientPage = () => {
  const { code, teamId } = useParams<{ code: string; teamId?: string }>();
  
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
  } = useVotingSession(teamId as "team1" | "team2" | undefined);
  
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
        {/* Simple header with just the question */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">{question}</h1>
            
            {/* Show timer when voting is active */}
            {votingActive && (
              <div className="mt-4 p-3 bg-blue-100 rounded-md">
                <p className="text-lg font-semibold text-blue-800">
                  Voting is active
                </p>
              </div>
            )}
            
            {/* Show message when voting has ended */}
            {!votingActive && showResults && (
              <div className="mt-4 p-3 bg-green-100 rounded-md">
                <p className="text-lg font-semibold text-green-800">
                  Voting has ended
                </p>
              </div>
            )}
          </div>
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
        {showResults && (
          <ResultsDisplay 
            showResults={showResults}
            teamVotes={teamVotes}
          />
        )}
      </div>
    </div>
  );
};

export default ClientPage;
