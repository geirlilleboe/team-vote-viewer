
import React from "react";
import TeamVotes from "@/components/TeamVotes";
import type { Vote } from "@/types/supabase";

interface ResultsDisplayProps {
  showResults: boolean;
  teamVotes: {
    team1: Vote[];
    team2: Vote[];
  };
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ showResults, teamVotes }) => {
  if (showResults) {
    return (
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
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <h2 className="text-xl font-semibold mb-2">Results are hidden</h2>
      <p className="text-gray-600">
        Start voting to see results at the end of the voting period.
      </p>
    </div>
  );
};

export default ResultsDisplay;
