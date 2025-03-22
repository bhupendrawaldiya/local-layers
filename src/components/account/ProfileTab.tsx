
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/contexts/ProfileContext";

export const ProfileTab = ({ handleSignOut }: { handleSignOut: () => Promise<void> }) => {
  const { profile, setProfile, isSaving, saveProfile, user } = useProfile();

  return (
    <div className="bg-white shadow rounded-lg p-6 md:p-8">
      <h1 className="text-2xl font-semibold mb-6 cl-black">Profile Information</h1>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 cl-black">Email</label>
          <Input type="email" value={user?.email || ""} disabled className="bg-gray-50" />
          <p className="mt-1 text-xs text-gray-500 cl-black">Email cannot be changed</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 cl-black">Full Name</label>
          <Input 
            type="text" 
            value={profile.fullName || ""} 
            onChange={(e) => setProfile({...profile, fullName: e.target.value})}
            placeholder="Enter your full name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 cl-black">Bio</label>
          <Textarea 
            value={profile.bio || ""} 
            onChange={(e) => setProfile({...profile, bio: e.target.value})}
            placeholder="Tell us a bit about yourself"
            rows={4}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 cl-black">Phone Number</label>
            <Input 
              type="tel" 
              value={profile.phoneNumber || ""} 
              onChange={(e) => setProfile({...profile, phoneNumber: e.target.value})}
              placeholder="Enter your phone number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 cl-black">Location</label>
            <Input 
              type="text" 
              value={profile.location || ""} 
              onChange={(e) => setProfile({...profile, location: e.target.value})}
              placeholder="Enter your location"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 cl-black">Account Created</label>
          <p className="text-gray-900">
            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
          </p>
        </div>
        
        <div className="flex justify-between items-center pt-4">
          <Button onClick={saveProfile} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          
          <Button variant="destructive" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};
