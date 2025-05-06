
import React from "react";
import { Button } from "@/components/ui/button";

interface VotingHeaderProps {
  question: string;
  votingActive: boolean;
  timeRemaining: number | null;
  showResults: boolean;
  onStartVoting: () => void;
  onResetVotes: () => void;
  onBack: () => void;
  isAdmin?: boolean;
}

const VotingHeader: React.FC<VotingHeaderProps> = ({
  question,
  votingActive,
  timeRemaining,
  showResults,
  onStartVoting,
  onResetVotes,
  onBack,
  isAdmin = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">{question}</h1>
        
        {isAdmin && (
          <div className="flex gap-2">
            {!votingActive && timeRemaining === null && (
              <Button variant="default" onClick={onStartVoting}>
                Start Voting (15s)
              </Button>
            )}
            <Button variant="outline" onClick={onBack}>
              Change Code
            </Button>
            <Button variant="destructive" onClick={onResetVotes}>
              Reset Votes
            </Button>
          </div>
        )}
      </div>
      
      {/* Show timer when voting is active */}
      {votingActive && timeRemaining !== null && (
        <div className="mt-4 p-3 bg-blue-100 rounded-md text-center">
          <p className="text-lg font-semibold">
            Time remaining: <span className="text-xl">{timeRemaining}</span> seconds
          </p>
          <p className="text-sm text-gray-600">
            Results will be shown when the timer ends
          </p>
        </div>
      )}
      
      {/* Show message when voting has ended */}
      {!votingActive && showResults && (
        <div className="mt-4 p-3 bg-green-100 rounded-md text-center">
          <p className="text-lg font-semibold">
            Voting has ended
          </p>
          <p className="text-sm text-gray-600">
            Results are now visible below
          </p>
        </div>
      )}
    </div>
  );
};

export default VotingHeader;
