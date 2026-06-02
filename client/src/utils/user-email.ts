import { getCurrentUser } from "../services/auth.service";

export async function getUserEmail(): Promise<string | null> {
  try {
    const response = await getCurrentUser();
    if (response.success && response.data?.email) {
      return response.data.email;
    }
    return null;
  } catch (error) {
    console.error('[UserEmail] Error fetching email:', error);
    return null;
  }
}