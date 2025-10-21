typescript
// src/types/index.ts

// --- API Request/Response Payloads ---

/**
 * Represents the structure of a request to the agent API.
 */
export interface AgentApiRequest {
  query: string;
}

/**
 * Represents the structure of a successful response from the agent API.
 */
export interface AgentApiResponse {
  query: string;
  response: string;
}

/**
 * Represents an error response from the agent API.
 */
export interface AgentApiError {
  message: string;
  status: number;
}

// --- Application-Specific Data Structures ---

/**
 * Represents a single message in the chat history.
 */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/**
 * Represents the state of the application's loading status.
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Represents the authentication session data.
 * Extend this with actual session data if needed.
 */
export interface Session {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  expires: string;
}

// --- UI Component Props ---

/**
 * Props for the Input component.
 * Extends standard HTML input attributes.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Props for the Button component.
 * Extends standard HTML button attributes.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

/**
 * Props for the Card component.
 * Extends standard HTML div attributes.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Props for the CardHeader component.
 * Extends standard HTML div attributes.
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Props for the CardTitle component.
 * Extends standard HTML heading attributes.
 */
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

/**
 * Props for the CardContent component.
 * Extends standard HTML div attributes.
 */
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Props for the CardFooter component.
 * Extends standard HTML div attributes.
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}