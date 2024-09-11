'use client'

import { useState } from 'react';
import { createClient } from '../utils/supabase/client';

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      console.log('File selected:', e.target.files[0].name);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    console.log('Starting upload for file:', file.name);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      console.log('Authenticated user:', user.id);

      const filePath = `${user.id}/${file.name}`;
      console.log('File path:', filePath);

      const { error } = await supabase.storage
        .from('file-upload')
        .upload(filePath, file);

      if (error) throw error;

      alert('File uploaded successfully!');
      console.log('File uploaded successfully!');
      setFile(null);
    } catch (error: any) {
      console.error('Error uploading file:', error.message);
      alert(`Error uploading file: ${error.message}`);
    } finally {
      setUploading(false);
      console.log('Upload process finished');
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
    </div>
  );
}
