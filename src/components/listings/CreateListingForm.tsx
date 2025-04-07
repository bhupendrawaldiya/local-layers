import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Image, Loader2 } from "lucide-react";
import { DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [condition, setCondition] = useState("Used");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const isMobile = useIsMobile();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      
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

  const handleAddCategory = () => {
    if (selectedCategory && !categories.includes(selectedCategory)) {
      setCategories([...categories, selectedCategory]);
      setSelectedCategory("");
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
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
      const imageUrl = await uploadImage();
      console.log("Image upload complete, URL:", imageUrl);
      
      if (!imageUrl) {
        throw new Error("Failed to upload image");
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      const userId = sessionData.session?.user.id;
      if (!userId) {
        toast.error("You must be logged in to create a listing");
        return;
      }

      console.log("Inserting listing data to database...");
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
            is_visible: true,
            categories,
            condition,
            tags
          }
        ]);

      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      
      console.log("Listing created successfully");
      toast.success("Listing created successfully!");
      
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
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow max-h-[80vh] overflow-y-auto">
      <DialogTitle className="text-xl font-semibold mb-4 text-left">Create New Listing</DialogTitle>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-left block">
            Title*
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter listing title"
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price" className="text-sm font-medium text-left block">
            Price (₹)*
          </Label>
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
        
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium text-left block">
            Location*
          </Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location"
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-left block">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter listing description"
            className="w-full min-h-[80px]"
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-medium text-left block">
            Image*
          </Label>
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

        <div className="space-y-2">
          <Label className="text-sm font-medium text-left block">
            Condition
          </Label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-black dark:text-white dark:bg-gray-700"
          >
            {['New', 'Like New', 'Good', 'Fair', 'Poor'].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-left block">
            Categories
          </Label>
          <div className={`flex ${isMobile ? 'flex-col' : 'gap-2'} mb-2`}>
            <Input
              type="text"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              placeholder="Add a category"
              className={isMobile ? 'mb-2' : ''}
            />
            <Button 
              type="button" 
              onClick={handleAddCategory}
              className={isMobile ? 'w-full' : ''}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category}
                className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-sm flex items-center text-black dark:text-white"
              >
                {category}
                <button
                  type="button"
                  onClick={() => setCategories(categories.filter(c => c !== category))}
                  className="ml-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-left block">
            Tags
          </Label>
          <Input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleAddTag}
            placeholder="Press Enter to add tags"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-sm flex items-center text-black dark:text-white"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => setTags(tags.filter(t => t !== tag))}
                  className="ml-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </span>
            ))}
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
