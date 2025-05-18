
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
  if (!showResults) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center border border-[#DFE1E6]">
        <h2 className="text-xl font-semibold mb-2 text-[#172B4D]">Results are hidden</h2>
        <p className="text-[#5E6C84]">
          Start voting to see results at the end of the voting period.
        </p>
      </div>
    );
  }
  
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
};

export default ResultsDisplay;
