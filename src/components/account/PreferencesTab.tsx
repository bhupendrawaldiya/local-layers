
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/contexts/ProfileContext";

export const PreferencesTab = () => {
  const { profile, setProfile, isSaving, saveProfile } = useProfile();

  return (
    <div className="bg-white shadow rounded-lg p-6 md:p-8">
      <h1 className="text-2xl font-semibold mb-6">Preferences</h1>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium text-gray-900">Email Notifications</h3>
            <p className="text-sm text-gray-500">Receive emails about new listings and updates</p>
          </div>
          <Switch 
            checked={profile.preferences?.notifications || false} 
            onCheckedChange={(checked) => {
              const currentPrefs = profile.preferences || {};
              setProfile({
                ...profile, 
                preferences: {
                  ...currentPrefs,
                  notifications: checked
                }
              });
            }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium text-gray-900">Newsletter</h3>
            <p className="text-sm text-gray-500">Subscribe to our monthly newsletter</p>
          </div>
          <Switch 
            checked={profile.preferences?.newsletter || false} 
            onCheckedChange={(checked) => {
              const currentPrefs = profile.preferences || {};
              setProfile({
                ...profile, 
                preferences: {
                  ...currentPrefs,
                  newsletter: checked
                }
              });
            }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium text-gray-900">Dark Mode</h3>
            <p className="text-sm text-gray-500">Switch to dark mode for better viewing at night</p>
          </div>
          <Switch 
            checked={profile.preferences?.darkMode || false} 
            onCheckedChange={(checked) => {
              const currentPrefs = profile.preferences || {};
              setProfile({
                ...profile, 
                preferences: {
                  ...currentPrefs,
                  darkMode: checked
                }
              });
            }}
          />
        </div>
        
        <div className="pt-4">
          <Button onClick={saveProfile} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </div>
    </div>
  );
};
