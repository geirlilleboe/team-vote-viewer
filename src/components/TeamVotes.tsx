
import React from "react";
import type { Vote } from "@/types/supabase";

interface TeamVotesProps {
  team: string;
  teamName: string;
  votes: Vote[];
  color: "blue" | "red";
}

const TeamVotes: React.FC<TeamVotesProps> = ({ teamName, votes, color }) => {
  // Count the votes
  const yesCount = votes.filter(v => v.vote === "yes").length;
  const noCount = votes.filter(v => v.vote === "no").length;
  const totalVotes = votes.length;
  
  // Calculate percentages for the progress bars
  const yesPercentage = totalVotes ? (yesCount / totalVotes) * 100 : 0;
  const noPercentage = totalVotes ? (noCount / totalVotes) * 100 : 0;
  
  // Determine background colors based on the team color - using Bulder Bank palette
  const bgColor = color === "blue" ? "bg-[#DEEBFF]" : "bg-[#FFE2DD]";
  const yesBarColor = color === "blue" ? "bg-[#0052CC]" : "bg-[#DE350B]";
  const noBarColor = color === "blue" ? "bg-[#4C9AFF]" : "bg-[#FF8F73]";
  
  return (
    <div className={`rounded-2xl shadow-sm p-6 ${bgColor} border border-white/50`}>
      <h2 className="text-xl font-bold mb-5 text-[#172B4D]">{teamName}</h2>
      
      {totalVotes > 0 ? (
        <div className="space-y-5">
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium text-[#172B4D]">Yes ({yesCount})</span>
              <span className="text-sm bg-white/50 px-2 py-0.5 rounded-full">{yesPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-white/50 rounded-full h-5 overflow-hidden">
              <div 
                className={`${yesBarColor} h-5 rounded-full transition-all duration-500`} 
                style={{ width: `${yesPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium text-[#172B4D]">No ({noCount})</span>
              <span className="text-sm bg-white/50 px-2 py-0.5 rounded-full">{noPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-white/50 rounded-full h-5 overflow-hidden">
              <div 
                className={`${noBarColor} h-5 rounded-full transition-all duration-500`} 
                style={{ width: `${noPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-sm text-[#5E6C84] mt-4 pt-3 border-t border-white/50">
            Total votes: <span className="font-medium">{totalVotes}</span>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-[#5E6C84] bg-white/30 rounded-xl">
          No votes recorded for this team
        </div>
      )}
    </div>
  );
};

export default TeamVotes;
