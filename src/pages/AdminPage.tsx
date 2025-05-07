import { useState } from "react";
import { useParams } from "react-router-dom";
import VotingHeader from "@/components/voting/VotingHeader";
import ResultsDisplay from "@/components/voting/ResultsDisplay";
import { useVotingSession } from "@/hooks/useVotingSession";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";
import { toast } from "@/hooks/use-toast";
import { TEAM1_HASH, TEAM2_HASH } from "@/hooks/voting/types";

// Generate random hash for team identification
const generateTeamHash = (team: string) => {
  const randomPart = Math.random().toString(36).substring(2, 8);
  // Encode the team name in the hash but make it non-obvious
  return `${randomPart}-${btoa(team).replace(/=/g, '')}`;
};

const AdminPage = () => {
  const { code } = useParams<{ code: string }>();
  const [showQRCodes, setShowQRCodes] = useState(false);
  
  // Use the fixed team identifiers instead of generating new ones
  const team1Hash = TEAM1_HASH;
  const team2Hash = TEAM2_HASH;
  
  const {
    question,
    teamVotes,
    votingActive,
    showResults,
    timeRemaining,
    isLoading,
    startVoting,
    resetVotes,
    handleBack
  } = useVotingSession();
  
  const baseUrl = window.location.origin;
  const team1Url = `${baseUrl}/client/${code}/team/${team1Hash}`;
  const team2Url = `${baseUrl}/client/${code}/team/${team2Hash}`;
  
  const copyToClipboard = (text: string, team: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "URL Copied",
        description: `${team} URL has been copied to clipboard`
      });
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading session...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Admin Header with question and controls */}
        <VotingHeader 
          question={question}
          votingActive={votingActive}
          timeRemaining={timeRemaining}
          showResults={showResults}
          onStartVoting={startVoting}
          onResetVotes={resetVotes}
          onBack={handleBack}
          isAdmin={true}
        />
        
        {/* QR Code Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Team Access QR Codes</h2>
            <Button onClick={() => setShowQRCodes(!showQRCodes)}>
              {showQRCodes ? "Hide QR Codes" : "Show QR Codes"}
            </Button>
          </div>
          
          {showQRCodes && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-700 mb-2">Team 1</h3>
                <div className="flex justify-center p-4 bg-white rounded">
                  <QRCode value={team1Url} size={180} />
                </div>
                <div className="mt-3 flex justify-center">
                  <Button 
                    size="sm" 
                    className="mt-2" 
                    onClick={() => copyToClipboard(team1Url, "Team 1")}
                  >
                    Copy URL
                  </Button>
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-red-700 mb-2">Team 2</h3>
                <div className="flex justify-center p-4 bg-white rounded">
                  <QRCode value={team2Url} size={180} />
                </div>
                <div className="mt-3 flex justify-center">
                  <Button 
                    size="sm" 
                    className="mt-2" 
                    onClick={() => copyToClipboard(team2Url, "Team 2")}
                  >
                    Copy URL
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Players can access the voting page by scanning these QR codes or using the direct links
            </p>
          </div>
        </div>
        
        {/* Display votes for both teams */}
        <ResultsDisplay 
          showResults={true} // Always show results for admin
          teamVotes={teamVotes}
        />
      </div>
    </div>
  );
};

export default AdminPage;
