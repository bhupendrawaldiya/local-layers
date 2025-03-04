
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Image, Loader2 } from "lucide-react";
import { DialogTitle } from "@/components/ui/dialog";

export function CreateListingForm({ onSuccess }: { onSuccess?: () => void }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create a preview URL
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      
      // Clean up the preview URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!file) return null;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }
      
      const { data } = supabase.storage
        .from('listing-images')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !price || !location) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!file) {
      toast.error("Please upload an image for your listing");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Starting image upload...");
      // Upload image first
      const imageUrl = await uploadImage();
      console.log("Image upload complete, URL:", imageUrl);
      
      if (!imageUrl) {
        throw new Error("Failed to upload image");
      }

      // Get current user
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      const userId = sessionData.session?.user.id;
      if (!userId) {
        toast.error("You must be logged in to create a listing");
        return;
      }

      console.log("Inserting listing data to database...");
      // Then create the listing with the image URL and seller_id
      const { error } = await supabase
        .from('listings')
        .insert([
          { 
            title, 
            price: parseFloat(price), 
            location, 
            image: imageUrl,
            description: description || null,
            seller_id: userId,
            is_visible: true
          }
        ]);

      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      
      console.log("Listing created successfully");
      toast.success("Listing created successfully!");
      
      // Reset form
      setTitle("");
      setPrice("");
      setLocation("");
      setDescription("");
      setFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating listing:", error);
      toast.error("Failed to create listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <DialogTitle className="text-xl font-semibold mb-4">Create New Listing</DialogTitle>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title*
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter listing title"
            className="w-full"
          />
        </div>
        
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price ($)*
          </label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            min="0"
            step="0.01"
            className="w-full"
          />
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location*
          </label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location"
            className="w-full"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter listing description"
            className="w-full min-h-[100px]"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image*
          </label>
          <Input
            ref={fileInputRef}
            id="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div 
            onClick={triggerFileInput}
            className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
          >
            {previewUrl ? (
              <div className="space-y-2">
                <div className="relative h-40 w-full">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="h-full w-full object-contain"
                  />
                </div>
                <p className="text-sm text-blue-600">Click to change image</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2 py-4">
                <Image className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500">Click to upload an image</p>
                <p className="text-xs text-gray-400">JPG, PNG, GIF up to 10MB</p>
              </div>
            )}
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting || isUploading}
        >
          {(isSubmitting || isUploading) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isUploading ? "Uploading image..." : "Creating..."}
            </>
          ) : "Create Listing"}
        </Button>
      </form>
    </div>
  );
}
