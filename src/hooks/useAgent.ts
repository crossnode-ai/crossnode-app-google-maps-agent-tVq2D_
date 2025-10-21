typescript
// src/hooks/useAgent.ts
"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { AgentApiRequest, AgentApiResponse } from "@/types";

const AGENT_ID = "9a538196-899a-4a3e-a6d8-361bd5d0bf9c";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface UseAgentOptions {
  initialQuery?: string;
}

interface UseAgentReturn {
  query: string;
  setQuery: (query: string) => void;
  results: AgentApiResponse | null;
  isLoading: boolean;
  error: string | null;
  submitQuery: () => Promise<void>;
}

export function useAgent({ initialQuery = "" }: UseAgentOptions = {}): UseAgentReturn {
  const { data: session } = useSession();
  const [query, setQuery] = useState<string>(initialQuery);
  const [results, setResults] = useState<AgentApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const submitQuery = useCallback(async () => {
    if (!query.trim()) {
      setError("Please enter a query.");
      return;
    }
    if (!API_URL) {
      setError("API URL is not configured.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    const requestPayload: AgentApiRequest = { query };
    const token = session?.user?.accessToken || "";

    try {
      const response = await fetch(`${API_URL}/agents/${AGENT_ID}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: AgentApiResponse = await response.json();
      setResults(data);
    } catch (err: any) {
      console.error("Error querying agent:", err);
      setError(err.message || "An unexpected error occurred.");
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, [query, session?.user?.accessToken]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    submitQuery,
  };
}