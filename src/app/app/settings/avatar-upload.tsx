"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfileAvatarAction } from "./actions";

export function AvatarUpload({ 
  initialUrl,
  onChange
}: { 
  initialUrl: string;
  onChange?: (url: string) => void;
}) {
  const [avatarUrl, setAvatarUrl] = useState(initialUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Compress and convert to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Get base64 string
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setAvatarUrl(dataUrl);
          if (onChange) onChange(dataUrl);

          // Submit to server action
          const formData = new FormData();
          formData.append("avatar_url", dataUrl);
          await updateProfileAvatarAction(formData);
          setIsUploading(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Profile Photo</label>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <div className="flex gap-2">
            <Input 
              name="avatar_url" 
              value={avatarUrl || ""} 
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/my-photo.jpg"
              className="bg-surface-200/50 border-surface-300/50 focus-visible:border-brand-500/50 text-white shadow-inner h-10"
            />
            <Button 
              type="button" 
              variant="secondary" 
              className="h-10 border border-surface-300/30 shadow-md px-4"
              onClick={async () => {
                const formData = new FormData();
                formData.append("avatar_url", avatarUrl);
                await updateProfileAvatarAction(formData);
                if (onChange) onChange(avatarUrl);
              }}
            >
              Save URL
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-sm hidden sm:inline">or</span>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <Button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-surface-200/80 hover:bg-surface-300 border border-surface-400/50 shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.5)] text-white font-semibold transition-all h-10 px-4"
          >
            <span className="mr-2 opacity-80">📸</span>
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>
        </div>
      </div>
    </div>
  );
}
