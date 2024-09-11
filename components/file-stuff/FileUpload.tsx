'use client'

import { useState } from 'react';
import { createClient } from '../../utils/supabase/client';

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // To store error messages
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    setErrorMessage(null); // Reset error message before upload
    if (!file) {
      setErrorMessage('No file selected.');
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

      const filePath = `${user.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('user-uploads')  // Ensure this bucket exists
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Upload Error: ${uploadError.message}`);
      }

      alert('File uploaded successfully!');
      setFile(null);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setErrorMessage(error.message || 'An unknown error occurred.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-4">
      <input
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
        className="mb-2"
      />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      
      {/* Display error messages if any */}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </div>
  );
}
