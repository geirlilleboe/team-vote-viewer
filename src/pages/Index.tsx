
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      navigate(`/client/${code}`);
    }
  };
  
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      navigate(`/admin/${code}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Team Vote Viewer</h1>
        
        <Tabs defaultValue="client" className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="client">Player</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>
          
          <TabsContent value="client">
            <p className="text-gray-600 mb-6 text-center">
              Enter your team code to start voting
            </p>
            
            <form onSubmit={handleClientSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="client-code">Team Code</Label>
                <Input 
                  id="client-code"
                  placeholder="Enter code" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                Enter as Player
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="admin">
            <p className="text-gray-600 mb-6 text-center">
              Enter your admin code to manage the session
            </p>
            
            <form onSubmit={handleAdminSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="admin-code">Admin Code</Label>
                <Input 
                  id="admin-code"
                  placeholder="Enter code" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                Enter as Admin
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
