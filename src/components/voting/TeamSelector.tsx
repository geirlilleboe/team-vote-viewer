
import React from "react";
import { Button } from "@/components/ui/button";

interface TeamSelectorProps {
  onSelectTeam: (team: "team1" | "team2") => void;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({ onSelectTeam }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-[#DFE1E6]">
      <h2 className="text-xl font-semibold mb-6 text-center text-[#172B4D]">Select your team</h2>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          className="flex-1 h-24 text-lg bg-[#DEEBFF] hover:bg-[#B3D4FF] text-[#0052CC] border border-[#B3D4FF] rounded-xl" 
          onClick={() => onSelectTeam("team1")}
        >
          Team 1
        </Button>
        <Button 
          className="flex-1 h-24 text-lg bg-[#FFEBE6] hover:bg-[#FFBDAD] text-[#DE350B] border border-[#FFBDAD] rounded-xl" 
          onClick={() => onSelectTeam("team2")}
        >
          Team 2
        </Button>
      </div>
    </div>
  );
};

export default TeamSelector;
