
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type VoteType = "yes" | "no" | null;

interface VotingControlsProps {
  teamName: string;
  votingActive: boolean;
  showResults: boolean;
  myVote: VoteType;
  onVote: (vote: VoteType) => void;
}

const VotingControls: React.FC<VotingControlsProps> = ({
  teamName,
  votingActive,
  showResults,
  myVote,
  onVote,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">
        Your Team: {teamName}
      </h2>
      <p className="mb-4">
        {votingActive 
          ? "Cast your vote:" 
          : showResults 
            ? "Voting has ended. Results are shown below." 
            : "Waiting for voting to start..."}
      </p>
      
      <ToggleGroup 
        type="single" 
        value={myVote || ""} 
        onValueChange={(v) => onVote(v as VoteType)}
        disabled={!votingActive}
      >
        <ToggleGroupItem 
          value="yes" 
          className="flex-1 text-lg py-6" 
          aria-label="Yes"
          disabled={!votingActive}
        >
          👍 Yes
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="no" 
          className="flex-1 text-lg py-6" 
          aria-label="No"
          disabled={!votingActive}
        >
          👎 No
        </ToggleGroupItem>
      </ToggleGroup>
      
      {/* Show personal vote if voted */}
      {myVote && (
        <div className="mt-4 text-center">
          <p>Your vote: <span className="font-semibold">{myVote === "yes" ? "👍 Yes" : "👎 No"}</span></p>
        </div>
      )}
    </div>
  );
};

export default VotingControls;
