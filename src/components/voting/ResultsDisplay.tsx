
import React, { useEffect, useState } from "react";
import TeamVotes from "@/components/TeamVotes";
import type { Vote } from "@/types/supabase";

interface ResultsDisplayProps {
  showResults: boolean;
  teamVotes: {
    team1: Vote[];
    team2: Vote[];
  };
  isAdmin?: boolean;
  votingActive?: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  showResults, 
  teamVotes, 
  isAdmin = false,
  votingActive = false 
}) => {
  // For admin users, always show results panel
  // For regular users, only show results if showResults is true AND voting is not active
  const shouldDisplayResults = isAdmin || (showResults && !votingActive);
  
  // Track if there are any votes to display
  const hasVotes = teamVotes.team1.length > 0 || teamVotes.team2.length > 0;
  
  if (!shouldDisplayResults) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center border border-[#DFE1E6]">
        <h2 className="text-xl font-semibold mb-2 text-[#172B4D]">Results are hidden</h2>
        <p className="text-[#5E6C84]">
          {votingActive 
            ? "Results will be available when voting ends" 
            : "Start voting to see results at the end of the voting period"}
        </p>
      </div>
    );
  }
  
  return (
    <div>
      {!hasVotes && (
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center border border-[#DFE1E6] mb-6">
          <h2 className="text-xl font-semibold mb-2 text-[#172B4D]">No votes yet</h2>
          <p className="text-[#5E6C84]">
            {isAdmin ? "Votes will appear here when participants start voting" : "Be the first to vote!"}
          </p>
        </div>
      )}
      
      {hasVotes && (
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
    </div>
  );
};

export default ResultsDisplay;
