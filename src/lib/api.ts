typescript
import { useSession } from "next-auth/react";

const AGENT_ID = "9a538196-899a-4a3e-a6d8-361bd5d0bf9c";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface QueryResponse {
  query: string;
  response: string;
}

interface ApiError {
  message: string;
  status: number;
}

export async function queryAgent(query: string): Promise<QueryResponse | ApiError> {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;

  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined.");
  }

  try {
    const response = await fetch(`${API_URL}/agent/${AGENT_ID}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        message: errorData.message || "An unknown error occurred",
        status: response.status,
      };
    }

    const data: QueryResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error("API Error:", error);
    return {
      message: error.message || "Failed to connect to the API",
      status: 500,
    };
  }
}