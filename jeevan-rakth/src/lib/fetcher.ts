/**
 * Automatic Token Refresh
 *
 * Helper function to refresh the access token when it expires.
 * Uses the refresh token stored in HTTP-only cookie.
 *
 * @returns True if refresh successful, false otherwise
 */
async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      console.log("Access token refreshed successfully");
      return true;
    }

    console.error("Failed to refresh access token");
    return false;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return false;
  }
}

/**
 * Fetcher with Automatic Token Refresh
 *
 * This fetcher automatically handles expired access tokens:
 * 1. Makes initial request with credentials (includes cookies)
 * 2. If 401 response with TOKEN_EXPIRED code, attempts token refresh
 * 3. Retries original request with new access token
 * 4. If refresh fails, redirects to login
 *
 * Security Features:
 * - Credentials included for cookie-based auth
 * - Automatic token refresh on expiry
 * - Single retry to prevent infinite loops
 * - Redirects to login if refresh fails
 */
export const fetcher = async (url: string) => {
  let res = await fetch(url, {
    credentials: "include", // Include cookies for authentication
  });

  // Handle token expiry with automatic refresh
  if (!res.ok && res.status === 401) {
    try {
      const errorData = await res.json();

      // Check if it's a token expiry error
      if (errorData.code === "TOKEN_EXPIRED") {
        console.log("Access token expired, attempting refresh...");

        // Attempt to refresh the token
        const refreshed = await refreshAccessToken();

        if (refreshed) {
          // Retry the original request with new token
          res = await fetch(url, {
            credentials: "include",
          });
        } else {
          // Refresh failed - redirect to login
          console.error("Token refresh failed, redirecting to login");
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw new Error("Authentication failed - please log in again");
        }
      }
    } catch (parseError) {
      // If JSON parsing fails, treat as regular error
      console.error("Failed to parse error response:", parseError);
    }
  }

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ message: "Failed to fetch data" }));
    throw new Error(error.message || "Failed to fetch data");
  }

  return res.json();
};
