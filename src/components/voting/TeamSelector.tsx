
import React from "react";
import { Button } from "@/components/ui/button";

interface TeamSelectorProps {
  onSelectTeam: (team: "team1" | "team2") => void;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({ onSelectTeam }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Select your team:</h2>
      <div className="flex gap-4">
        <Button 
          className="flex-1 h-20 text-lg bg-blue-500 hover:bg-blue-600" 
          onClick={() => onSelectTeam("team1")}
        >
          Team 1
        </Button>
        <Button 
          className="flex-1 h-20 text-lg bg-red-500 hover:bg-red-600" 
          onClick={() => onSelectTeam("team2")}
        >
          Team 2
        </Button>
      </div>
    </div>
  );
};

export default TeamSelector;
