'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink } from 'lucide-react';
import { Carousel } from '@/components/ui/carousel'; // Import Carousel component from Shadcn

interface FileInfo {
  name: string;
  url: string;
  createdAt: string;
  size: number;
}

export default function FileList() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('User not authenticated');

        const userFolder = `${user.id}/`;
        const { data: files, error: listError } = await supabase.storage
          .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET!)
          .list(userFolder);
        
        if (listError) throw listError;

        const fileInfos = await Promise.all(
          files?.map(async (file) => {
            const { data, error } = await supabase
              .storage
              .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET!)
              .createSignedUrl(`${userFolder}${file.name}`, 3600); // URL valid for 1 hour

            if (error) throw error;

            return {
              name: file.name,
              url: data.signedUrl,
              createdAt: file.created_at,
              size: file.metadata.size
            };
          }) || []
        );

        setFiles(fileInfos);
      } catch (error: any) {
        console.error('Error fetching files:', error.message);
        setErrorMessage(error.message || 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [supabase]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      {loading && <p>Loading files...</p>}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      {!loading && files.length === 0 && (
        <p>No files uploaded yet.</p>
      )}
      {!loading && files.length > 0 && (
        <div>
          {/* Carousel for displaying images */}
          <Carousel className="mb-4">
            {files.map((file, index) => (
              <div key={index} className="relative">
                <img src={file.url} alt={file.name} className="w-full h-auto" />
              </div>
            ))}
          </Carousel>
          
          {/* Table displaying file details */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file, index) => (
                <TableRow key={index}>
                  <TableCell>{file.name}</TableCell>
                  <TableCell>{new Date(file.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 flex items-center"
                    >
                      Open <ExternalLink className="ml-1" size={16} />
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
