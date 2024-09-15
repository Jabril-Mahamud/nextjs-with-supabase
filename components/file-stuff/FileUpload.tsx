'use client'

import { useState } from 'react';
import { createClient } from '../../utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react'; // For loading spinner
import { useToast } from '@/hooks/use-toast'; // Import useToast hook

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();
  const { toast } = useToast(); // Initialize toast

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Upload Error",
        description: "No file selected.",
        variant: "destructive", // Error toast
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        throw new Error(`Authentication Error: ${authError.message}`);
      }
      if (!user) {
        throw new Error('User not authenticated. Please log in.');
      }

      // Append a unique timestamp to the file name
      const uniqueFileName = `${Date.now()}_${file.name}`;
      const filePath = `${user.id}/${uniqueFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-uploads')  // Ensure this bucket exists
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Upload Error: ${uploadError.message}`);
      }

      // Success toast
      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });

      setFile(null); // Clear the file input
    } catch (error: any) {
      console.error('Error uploading file:', error);

      // Error toast
      toast({
        title: "Upload Error",
        description: error.message || 'An unknown error occurred.',
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {/* File Input */}
      <Input
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
        className="mb-2"
      />

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full"
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          'Upload'
        )}
      </Button>
    </div>
  );
}
