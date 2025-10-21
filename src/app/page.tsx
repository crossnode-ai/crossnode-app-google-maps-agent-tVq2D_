typescript
"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Search } from "lucide-react";

const AGENT_ID = "9a538196-899a-4a3e-a6d8-361bd5d0bf9c";

interface AgentResponse {
  query: string;
  response: string;
  error?: string;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<AgentResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSubmit = useCallback(async () => {
    if (!query.trim()) {
      setError("Please enter a query.");
      return;
    }
    if (status === "loading") {
      return; // Prevent submission while session is loading
    }
    if (!session?.user?.email) {
      setError("Authentication required. Please sign in.");
      return;
    }

    setIsLoading(true);
    setResults(null);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agent/invoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.accessToken}`, // Assuming accessToken is available
        },
        body: JSON.stringify({
          agentId: AGENT_ID,
          input: { query: query },
          userId: session.user.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: AgentResponse = await response.json();
      setResults(data);
    } catch (err: any) {
      console.error("Error submitting query:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [query, session, status]);

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Google Maps Agent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              id="query"
              placeholder="Enter your location query (e.g., 'restaurants near Eiffel Tower')"
              value={query}
              onChange={handleQueryChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
              className="flex-grow"
              aria-label="Location query input"
            />
            <Button onClick={handleSubmit} disabled={isLoading || status === "loading" || !session?.user?.email}>
              {isLoading ? <Spinner className="h-4 w-4" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <Spinner className="h-12 w-12" />
            </div>
          )}

          {results && !isLoading && (
            <Card className="mt-6 bg-secondary/30">
              <CardHeader>
                <CardTitle className="text-lg">Agent Response</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Your Query: {results.query}</p>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: results.response }} />
              </CardContent>
            </Card>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {status === "unauthenticated" && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>Please sign in to use the agent.</AlertDescription>
            </Alert>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}