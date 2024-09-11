'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function FileList() {
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        // Get the authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('User not authenticated');

        const userFolder = `${user.id}/`;

        // List files in the bucket from the user's folder
        const { data: files, error: listError } = await supabase.storage
          .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET!)  // Use env variable for the bucket name
          .list(userFolder);

        if (listError) throw listError;

        // Fetch signed URLs for the files (for private buckets)
        const fileSignedUrls = await Promise.all(
          files?.map(async (file) => {
            const { data, error } = await supabase
              .storage
              .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET!)
              .createSignedUrl(`${userFolder}${file.name}`, 60); // URL valid for 60 seconds
            if (error) throw error;
            return { name: file.name, url: data.signedUrl };
          }) || []
        );

        setFiles(fileSignedUrls);
      } catch (error: any) {
        console.error('Error fetching files:', error.message);
        setErrorMessage(error.message || 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [supabase]);

  return (
    <div>
      {loading && <p>Loading files...</p>}

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}

      {!loading && files.length === 0 && (
        <p>No files uploaded yet.</p>
      )}

      {!loading && files.length > 0 && (
        <ul>
          {files.map((file, index) => (
            <li key={index}>
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                {file.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
