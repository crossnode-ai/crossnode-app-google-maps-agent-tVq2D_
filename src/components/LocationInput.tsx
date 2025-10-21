typescript
"use client";

import { useState, useCallback, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { AgentApiRequest, AgentApiResponse } from "@/types";

const AGENT_ID = "9a538196-899a-4a3e-a6d8-361bd5d0bf9c";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface LocationInputProps {
  onLocationSubmit: (location: string) => void;
  isLoading: boolean;
  error: string | null;
}

export function LocationInput({ onLocationSubmit, isLoading, error }: LocationInputProps) {
  const { data: session } = useSession();
  const [locationQuery, setLocationQuery] = useState<string>("");

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!locationQuery.trim() || !session?.user?.accessToken) {
      return;
    }

    const requestPayload: AgentApiRequest = {
      query: locationQuery,
    };

    try {
      const response = await fetch(`${API_URL}/agents/${AGENT_ID}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data: AgentApiResponse = await response.json();
      onLocationSubmit(data.response);
      setLocationQuery(""); // Clear input after successful submission
    } catch (err) {
      console.error("Failed to submit location query:", err);
      // The error state is managed by the parent component, so we don't set it here.
      // The parent component will receive the error from the API call.
    }
  }, [locationQuery, session?.user?.accessToken, onLocationSubmit]);

  return (
    <Card className="w-full max-w-lg mx-auto my-8">
      <CardHeader>
        <CardTitle>Enter Your Location</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="text"
            placeholder="e.g., Eiffel Tower, Paris"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            disabled={isLoading}
            aria-label="Location query input"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={!locationQuery.trim() || isLoading || !session?.user?.accessToken}
          className="w-full"
          aria-label="Submit location query"
        >
          {isLoading ? "Searching..." : "Search Location"}
        </Button>
      </CardFooter>
    </Card>
  );
}