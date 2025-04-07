
import React, { createContext, useContext, useState, ReactNode } from "react";
import { UserProfile } from "@/types/user";
import { User } from "@supabase/supabase-js";
import { ListingCard as ListingCardType } from "@/types/listings";

interface ProfileContextType {
  user: User | null;
  profile: Partial<UserProfile>;
  wishlistedItems: ListingCardType[];
  setProfile: React.Dispatch<React.SetStateAction<Partial<UserProfile>>>;
  setWishlistedItems: React.Dispatch<React.SetStateAction<ListingCardType[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isSaving: boolean;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;
  saveProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children, saveProfileFn }: { children: ReactNode, saveProfileFn: () => Promise<void> }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    fullName: "",
    bio: "",
    phoneNumber: "",
    location: "",
  });
  const [wishlistedItems, setWishlistedItems] = useState<ListingCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <ProfileContext.Provider
      value={{
        user,
        profile,
        setProfile,
        wishlistedItems,
        setWishlistedItems,
        isLoading,
        setIsLoading,
        isSaving,
        setIsSaving,
        saveProfile: saveProfileFn,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};

export const withProfileContext = (Component: React.ComponentType, user: User | null) => {
  return (props: any) => (
    <ProfileProvider saveProfileFn={props.saveProfile}>
      <Component {...props} />
    </ProfileProvider>
  );
};
