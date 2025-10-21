"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { queryAgent } from "@/lib/api"; // Assuming queryAgent is refactored to accept token
import { AgentApiResponse, AgentApiError } from "@/types";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<AgentApiResponse | null>(null);
  const [error, setError] = useState<AgentApiError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleQuery = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults(null);

    const token = session?.user?.accessToken;

    try {
      // Pass the token to the refactored queryAgent function
      const response = await queryAgent(query, token);

      if ((response as AgentApiError).message) {
        setError(response as AgentApiError);
      } else {
        setResults(response as AgentApiResponse);
      }
    } catch (err: any) {
      console.error("Error during query:", err);
      setError({
        message: err.message || "An unexpected error occurred.",
        status: err.status || 500,
      });
    } finally {
      setIsLoading(false);
    }
  }, [query, session?.user?.accessToken]); // Include session dependency

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(event.target.value);
  };

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Loading session...</div>;
  }

  // If not authenticated, you might want to show a login prompt or redirect
  if (!session) {
    return <div className="flex justify-center items-center h-screen">Please sign in to use the agent.</div>;
  }

  return (
    <main className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Google Maps Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label htmlFor="queryInput" className="block text-sm font-medium text-gray-700">
                Enter your query:
              </label>
              <Textarea
                id="queryInput"
                placeholder="e.g., Find Italian restaurants near Eiffel Tower"
                value={query}
                onChange={handleInputChange}
                className="min-h-[150px]"
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleQuery} disabled={isLoading || !query.trim()}>
              {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null} Query Agent
            </Button>
          </CardFooter>
        </Card>

        {/* Results Section */}
        <div>
          {isLoading && (
            <div className="flex justify-center items-center h-full">
              <Spinner size="lg" />
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error.message} (Status: {error.status})</AlertDescription>
            </Alert>
          )}
          {results && (
            <Card>
              <CardHeader>
                <CardTitle>Agent Response</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-800 whitespace-pre-wrap">
                  {results.response}
                </p>
              </CardContent>
              <CardFooter>
                <small className="text-gray-500">Query: {results.query}</small>
              </CardFooter>
            </Card>
          )}
          {!isLoading && !error && !results && (
            <div className="flex justify-center items-center h-full text-gray-500">
              Your query results will appear here.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
