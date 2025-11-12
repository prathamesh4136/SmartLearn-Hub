import { auth } from "../lib/firebaseClient";

export async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    // Force refresh so tokens are always valid
    return await user.getIdToken(true);
  } catch (err) {
    console.error("Token refresh failed:", err);
    return null;
  }
}

export function ensureAuthHeaders(base: Record<string, string> = {}): Record<string, string> {
  // We'll return a Promise because we need async
  throw new Error("ensureAuthHeaders must be called async via getAuthHeaders()");
}

// ✅ Async version that actually fetches fresh token
export async function getAuthHeaders(extra: Record<string, string> = {}) {
  const token = await getAuthToken();
  if (!token) throw new Error("No auth token found - please log in again");
  return {
    ...extra,
    Authorization: `Bearer ${token}`,
  };
}
