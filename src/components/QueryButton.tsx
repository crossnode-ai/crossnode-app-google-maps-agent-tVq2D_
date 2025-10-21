typescript
"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { AgentApiRequest, AgentApiResponse } from "@/types";
import { queryAgent } from "@/lib/api";

interface QueryButtonProps {
  onQuerySubmit: (response: AgentApiResponse) => void;
  onError: (error: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function QueryButton({ onQuerySubmit, onError, isLoading, setIsLoading }: QueryButtonProps) {
  const { data: session } = useSession();
  const [query, setQuery] = useState<string>("");

  const handleQuery = useCallback(async () => {
    if (!query.trim()) {
      onError("Please enter a query.");
      return;
    }
    if (!session?.user?.id) {
      onError("Authentication required.");
      return;
    }

    setIsLoading(true);
    try {
      const requestPayload: AgentApiRequest = { query };
      const response = await queryAgent(requestPayload);
      onQuerySubmit(response);
    } catch (error: any) {
      console.error("Error querying agent:", error);
      onError(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
      setQuery(""); // Clear input after successful submission
    }
  }, [query, session?.user?.id, onQuerySubmit, onError, setIsLoading]);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleQuery();
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto my-4">
      <CardHeader>
        <CardTitle>Ask the Google Maps Agent</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <Input
            placeholder="e.g., Find Italian restaurants near me"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button onClick={handleQuery} disabled={isLoading || !query.trim()}>
            {isLoading ? "Processing..." : "Ask Agent"}
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Enter your location-based query and let the agent assist you.
        </p>
      </CardFooter>
    </Card>
  );
}