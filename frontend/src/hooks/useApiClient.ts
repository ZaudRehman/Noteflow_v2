import { useCallback } from "react";
import { useAuth } from "./useAuth";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type ApiClientOptions = {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  skipAuth?: boolean; // Skip adding Authorization header
};

export function useApiClient() {
  const { token, logout } = useAuth();

  const callApi = useCallback(
    async <T = any>(url: string, options: ApiClientOptions = {}): Promise<T> => {
      const { method = "GET", body, headers = {}, skipAuth = false } = options;

      const fetchOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      };

      if (body !== undefined) {
        fetchOptions.body = JSON.stringify(body);
      }

      if (!skipAuth && token) {
        fetchOptions.headers = {
          ...fetchOptions.headers,
          Authorization: `Bearer ${token}`,
        };
      }

      try {
        const response = await fetch(url, fetchOptions);

        if (response.status === 401) {
          // Unauthorized - token might be invalid or expired
          logout();
          throw new Error("Unauthorized - please log in again.");
        }

        if (!response.ok) {
          // Attempt to parse error message from response
          let errorMessage = response.statusText;

          try {
            const errorData = await response.json();
            if (errorData?.error) {
              errorMessage = errorData.error;
            } else if (typeof errorData === "string") {
              errorMessage = errorData;
            }
          } catch (parseError) {
            console.warn("Failed to parse error response", parseError);
          }

          throw new Error(errorMessage);
        }

        // Check for empty response body
        const text = await response.text();
        if (!text) return {} as T;

        return JSON.parse(text) as T;
      } catch (error) {
        // Rethrow known errors
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("An unknown error occurred");
      }
    },
    [token, logout]
  );

  return callApi;
}
