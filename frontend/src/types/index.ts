// Shared TypeScript interfaces and types for the app

// User representation
export interface User {
    id: string;
    username: string;
    email?: string;
    avatarUrl?: string;
  }
  
  // Note summary for listing
  export interface NoteSummary {
    id: string;
    title?: string;
    excerpt?: string;
    tags: string[];
    revision: number;
    updatedAt: string; // ISO date string
  }
  
  // Full note detail
  export interface NoteDetail extends NoteSummary {
    content: string; // HTML or markdown content
  }
  
  // Tag type
  export type Tag = string;
  
  // Revision record
  export interface Revision {
    id: string;
    revisionNumber: number;
    bodyHtml: string;   // HTML snapshot of note content at revision
    createdAt: string;  // ISO timestamp
  }
  
  // API response wrapper (generic)
  export interface ApiResponse<T> {
    data: T;
    error?: string;
    success: boolean;
  }
  
  // Authentication context value
  export interface AuthContextValue {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    login: (username: string, password: string) => Promise<void>;
    signup: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
  }
  
  // Collaborator presence
  export interface Collaborator {
    id: string;
    name: string;
    color: string; // assigned pastel color
  }
  