
import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/contexts/ProfileContext";
import { Camera, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export const ProfileTab = ({ handleSignOut }: { handleSignOut: () => Promise<void> }) => {
  const { profile, setProfile, isSaving, saveProfile, user } = useProfile();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    setIsUploading(true);
    try {
      // Check if avatars bucket exists, if not this will fail silently
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        toast.error('Failed to upload profile picture');
        return;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setProfile({...profile, avatar: data.publicUrl });
      toast.success('Profile picture uploaded');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const userEmail = user?.email || (user?.app_metadata?.provider === 'google' && user?.user_metadata?.email) || '';

  return (
    <div className="bg-white shadow rounded-lg p-6 md:p-8">
      <h1 className="text-2xl font-semibold mb-6 cl-black">Profile Information</h1>
      
      <div className="flex flex-col items-center mb-6">
        <div 
          className="relative cursor-pointer group"
          onClick={handleAvatarClick}
        >
          <Avatar className="h-24 w-24 border-2 border-primary/20">
            {profile.avatar ? (
              <AvatarImage src={profile.avatar} alt="Profile" />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary">
                <User className="h-12 w-12" />
              </AvatarFallback>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              <Camera className="h-8 w-8 text-white" />
            </div>
          </Avatar>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Click to {profile.avatar ? "change" : "upload"} profile picture
        </p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 cl-black">Email</label>
          <Input type="email" value={userEmail} disabled className="bg-gray-50" />
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
          <label className="block text-sm font-medium text-gray-700 mb-1 cl-black">Location</label>
          <Input 
            type="text" 
            value={profile.location || ""} 
            onChange={(e) => setProfile({...profile, location: e.target.value})}
            placeholder="Enter your location"
          />
        </div>
        
        <div className="flex justify-between items-center pt-4">
          <Button onClick={saveProfile} disabled={isSaving || isUploading}>
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
