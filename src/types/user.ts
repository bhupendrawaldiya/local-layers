
export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  bio?: string;
  avatar?: string;
  phoneNumber?: string;
  location?: string;
  preferences?: {
    notifications?: boolean;
    newsletter?: boolean;
    darkMode?: boolean;
  };
  created_at: string;
}
