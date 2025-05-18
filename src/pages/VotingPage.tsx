
import { useState } from "react";
import VotingHeader from "@/components/voting/VotingHeader";
import TeamSelector from "@/components/voting/TeamSelector";
import VotingControls from "@/components/voting/VotingControls";
import ResultsDisplay from "@/components/voting/ResultsDisplay";
import { useVotingSession } from "@/hooks/useVotingSession";

const VotingPage = () => {
  const {
    question,
    selectedTeam,
    myVote,
    teamVotes,
    votingActive,
    showResults,
    timeRemaining,
    isLoading,
    handleTeamSelect,
    handleVote,
    startVoting,
    resetVotes,
    handleBack
  } = useVotingSession();
  
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
        <VotingHeader 
          question={question}
          votingActive={votingActive}
          timeRemaining={timeRemaining}
          showResults={showResults}
          onStartVoting={startVoting}
          onResetVotes={resetVotes}
          onBack={handleBack}
        />
        
        {/* Team selection if not selected */}
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
        
        {/* Display votes for both teams only when allowed */}
        <ResultsDisplay 
          showResults={showResults}
          teamVotes={teamVotes}
          isAdmin={false}
        />
      </div>
    </div>
  );
};

export default VotingPage;
