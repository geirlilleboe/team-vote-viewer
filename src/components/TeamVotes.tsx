
import React from "react";

type Vote = "yes" | "no" | null;

interface TeamVotesProps {
  team: string;
  teamName: string;
  votes: Record<string, Vote>;
  color: "blue" | "red";
}

const TeamVotes: React.FC<TeamVotesProps> = ({ teamName, votes, color }) => {
  // Count the votes
  const yesCount = Object.values(votes).filter(v => v === "yes").length;
  const noCount = Object.values(votes).filter(v => v === "no").length;
  const totalVotes = Object.keys(votes).length;
  
  // Calculate percentages for the progress bars
  const yesPercentage = totalVotes ? (yesCount / totalVotes) * 100 : 0;
  const noPercentage = totalVotes ? (noCount / totalVotes) * 100 : 0;
  
  // Determine background colors based on the team color
  const bgColor = color === "blue" ? "bg-blue-100" : "bg-red-100";
  const yesBarColor = color === "blue" ? "bg-blue-500" : "bg-red-500";
  const noBarColor = color === "blue" ? "bg-blue-300" : "bg-red-300";
  
  return (
    <div className={`rounded-lg shadow-md p-6 ${bgColor}`}>
      <h2 className="text-xl font-bold mb-4">{teamName}</h2>
      
      {totalVotes > 0 ? (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Yes ({yesCount})</span>
              <span className="text-sm">{yesPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={`${yesBarColor} h-4 rounded-full`} 
                style={{ width: `${yesPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">No ({noCount})</span>
              <span className="text-sm">{noPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={`${noBarColor} h-4 rounded-full`} 
                style={{ width: `${noPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 mt-2">
            Total votes: {totalVotes}
          </div>
        </div>
      ) : (
        <div className="py-4 text-center text-gray-500">
          No votes recorded for this team
        </div>
      )}
    </div>
  );
};

export default TeamVotes;
