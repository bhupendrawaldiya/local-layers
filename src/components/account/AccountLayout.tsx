
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "./ProfileTab";
import { WishlistTab } from "./WishlistTab";
import { PreferencesTab } from "./PreferencesTab";

interface AccountLayoutProps {
  handleSignOut: () => Promise<void>;
}

export const AccountLayout: React.FC<AccountLayoutProps> = ({ handleSignOut }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <ProfileTab handleSignOut={handleSignOut} />
        </TabsContent>
        
        <TabsContent value="wishlist">
          <WishlistTab />
        </TabsContent>
        
        <TabsContent value="preferences">
          <PreferencesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
