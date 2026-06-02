import { getCurrentUser } from '../services/auth.service';
import type { UserProfileData } from '../components/user-profile-dropdown';


export async function getUserDetails(): Promise<UserProfileData | null> {
  try {
    const response = await getCurrentUser();
    
    if (response.success && response.data) {
      const user = response.data;
      
      return {
        username: `${user.firstName} ${user.lastName}`,
        lastLogin: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : undefined
      };
    }
    
    return null;
  } catch (error) {
    console.error('[UserDetails] Error fetching user details:', error);
    return null;
  }
}