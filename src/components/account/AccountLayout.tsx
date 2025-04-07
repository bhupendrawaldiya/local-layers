
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "./ProfileTab";
import { WishlistTab } from "./WishlistTab";
import { MyListingsTab } from "./MyListingsTab";

interface AccountLayoutProps {
  handleSignOut: () => Promise<void>;
}

export const AccountLayout: React.FC<AccountLayoutProps> = ({ handleSignOut }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="my-listings">My Listings</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
          <TabsTrigger value="messages" onClick={() => window.location.href = "/messages"}>Messages</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <ProfileTab handleSignOut={handleSignOut} />
        </TabsContent>
        
        <TabsContent value="my-listings">
          <MyListingsTab />
        </TabsContent>
        
        <TabsContent value="wishlist">
          <WishlistTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
