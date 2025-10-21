// src/components/ResultsCard.tsx

"use client";

import React, { useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AgentApiResponse } from "@/types";

interface ResultsCardProps {
  title: string;
  results: AgentApiResponse | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

const ResultsCard: React.FC<ResultsCardProps> = ({
  title,
  results,
  isLoading,
  error,
  onRetry,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-40">
          <p className="text-muted-foreground animate-pulse">Loading results...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-40 text-red-500">
          <p className="text-center">{error}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="mt-4">
              Retry
            </Button>
          )}
        </div>
      );
    }

    if (!results || !results.response) {
      return (
        <div className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">No results found.</p>
        </div>
      );
    }

    // Assuming results.response is a string that might contain structured data or plain text
    // For now, we'll display it as pre-formatted text for better readability of potential JSON or code.
    // In a real-world scenario, you might want to parse JSON and render it more nicely.
    return (
      <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        {results.response}
      </pre>
    );
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-primary/10 dark:bg-primary/20 px-6 py-4 border-b">
        <CardTitle className="text-xl font-semibold text-primary dark:text-primary-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {renderContent()}
      </CardContent>
      {results && results.response && (
        <CardFooter className="bg-secondary/5 dark:bg-secondary/10 px-6 py-4 border-t flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleExpand}
            className="rounded-md hover:bg-primary/5 dark:hover:bg-primary/15"
          >
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ResultsCard;