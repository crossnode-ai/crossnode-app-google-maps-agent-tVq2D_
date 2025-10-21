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

// This function needs to be refactored to accept the token as a parameter
// or be called from within a component/hook that has access to the session.
export async function queryAgent(query: string, token: string | undefined): Promise<QueryResponse | ApiError> {
  // const { data: session } = useSession(); // This line is removed as useSession cannot be used here
  // const token = session?.user?.accessToken; // This line is removed as token is now a parameter

  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined.");
  }

  if (!token) {
    // Handle the case where the user is not authenticated or token is missing
    // This might involve returning an error or redirecting the user to login
    return {
      message: "Authentication token is missing.",
      status: 401,
    };
  }

  try {
    const response = await fetch(`${API_URL}/agents/${AGENT_ID}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      return { ...errorData, status: response.status };
    }

    const data: QueryResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error querying agent:", error);
    return {
      message: error.message || "An unexpected error occurred.",
      status: 500,
    };
  }
}
