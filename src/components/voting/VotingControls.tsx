
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
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-[#DFE1E6]">
      <div className="flex items-center justify-center mb-4">
        <div className="px-4 py-2 bg-[#F4F5F7] rounded-full">
          <h2 className="text-xl font-semibold text-[#172B4D]">
            Your Team: {teamName}
          </h2>
        </div>
      </div>
      
      <p className="mb-5 text-center text-[#5E6C84]">
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
        className="w-full bg-[#F4F5F7] p-2 rounded-xl"
      >
        <ToggleGroupItem 
          value="yes" 
          className="flex-1 text-lg py-6 rounded-xl data-[state=on]:bg-[#0052CC] data-[state=on]:text-white" 
          aria-label="Yes"
          disabled={!votingActive}
        >
          👍 Yes
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="no" 
          className="flex-1 text-lg py-6 rounded-xl data-[state=on]:bg-[#DE350B] data-[state=on]:text-white" 
          aria-label="No"
          disabled={!votingActive}
        >
          👎 No
        </ToggleGroupItem>
      </ToggleGroup>
      
      {/* Show personal vote if voted */}
      {myVote && (
        <div className="mt-5 text-center p-3 bg-white border border-[#DFE1E6] rounded-xl">
          <p className="text-[#172B4D]">Your vote: 
            <span className={`font-semibold ml-1 ${myVote === "yes" ? "text-[#0052CC]" : "text-[#DE350B]"}`}>
              {myVote === "yes" ? "👍 Yes" : "👎 No"}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default VotingControls;
