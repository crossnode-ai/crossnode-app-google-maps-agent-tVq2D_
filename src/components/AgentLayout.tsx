// src/components/AgentLayout.tsx

"use client";

import React, { useState, useCallback, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AgentApiRequest, AgentApiResponse } from "@/types";
import { queryAgent } from "@/lib/api";

const AGENT_ID = "9a538196-899a-4a3e-a6d8-361bd5d0bf9c";

const AgentLayout: React.FC = () => {
  const { data: session, status } = useSession();
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<AgentApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!query.trim()) {
        setError("Please enter a query.");
        return;
      }
      if (status !== "authenticated") {
        setError("Please log in to use the agent.");
        return;
      }

      setIsLoading(true);
      setError(null);
      setResults(null);

      try {
        const requestPayload: AgentApiRequest = { query };
        const response = await queryAgent(AGENT_ID, requestPayload, session?.accessToken);

        if (response.ok) {
          const data: AgentApiResponse = await response.json();
          setResults(data);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || "An unknown error occurred");
        }
      } catch (err: any) {
        console.error("Agent query failed:", err);
        setError(err.message || "Failed to get a response from the agent.");
      } finally {
        setIsLoading(false);
      }
    },
    [query, session?.accessToken, status]
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Your Location Query</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Enter your location query (e.g., 'restaurants near Eiffel Tower')"
                value={query}
                onChange={handleQueryChange}
                aria-label="Location query input"
                disabled={isLoading || status !== "authenticated"}
              />
              <Button type="submit" className="w-full" disabled={isLoading || status !== "authenticated"}>
                {isLoading ? <Spinner className="h-4 w-4" /> : "Search"}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            {status === "unauthenticated" && (
              <Alert variant="warning">
                <AlertTitle>Authentication Required</AlertTitle>
                <AlertDescription>Please log in to use the Google Maps Agent.</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </Card>

        <motion.div layout className="flex flex-col">
          <AnimatePresence>
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-full"
              >
                <Spinner className="h-12 w-12" />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {results && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Card className="h-full shadow-lg flex flex-col">
                  <CardHeader>
                    <CardTitle>Results</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow overflow-auto">
                    <div dangerouslySetInnerHTML={{ __html: results.response }} />
                  </CardContent>
                  <CardFooter>
                    <Separator className="my-4" />
                    <p className="text-sm text-muted-foreground">
                      Query: "{results.query}"
                    </p>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {!isLoading && !results && !error && status === "authenticated" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center justify-center h-full text-muted-foreground"
            >
              Enter a query above to see results here.
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AgentLayout;