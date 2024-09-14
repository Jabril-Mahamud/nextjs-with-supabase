'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

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
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const supabase = createClient();
  const { theme } = useTheme();
  const { toast } = useToast();

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
              .createSignedUrl(`${userFolder}${file.name}`, 3600);

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

  const isImageFile = (fileName: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  const downloadAllFiles = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    let downloadedCount = 0;

    for (const file of files) {
      try {
        const response = await fetch(file.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        downloadedCount++;
        setDownloadProgress((downloadedCount / files.length) * 100);
      } catch (error) {
        console.error(`Error downloading ${file.name}:`, error);
        toast({
          title: "Download Error",
          description: `Failed to download ${file.name}`,
          variant: "destructive",
        });
      }
    }

    setIsDownloading(false);
    toast({
      title: "Download Complete",
      description: `Successfully downloaded ${downloadedCount} out of ${files.length} files.`,
    });
  };

  return (
    <div className="p-4">
      {loading && <p className="text-center">Loading files...</p>}
      {errorMessage && <p className="text-center text-red-500 dark:text-red-400">{errorMessage}</p>}
      {!loading && files.length === 0 && (
        <p className="text-center">No files uploaded yet.</p>
      )}
      {!loading && files.length > 0 && (
        <div>
          <div className="mb-6 flex flex-col items-center gap-4">
            <Button 
              onClick={downloadAllFiles} 
              disabled={isDownloading}
              className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 flex items-center gap-2"
            >
              <Download size={16} />
              {isDownloading ? 'Downloading...' : 'Download All'}
            </Button>
            <Link href="/files">
              <Button className="bg-green-500 text-white hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800">
                Upload Page
              </Button>
            </Link>
            {isDownloading && (
              <div className="w-full max-w-xs">
                <Progress value={downloadProgress} className="w-full" />
                <p className="text-center mt-2">{`${Math.round(downloadProgress)}% Complete`}</p>
              </div>
            )}
          </div>
          {/* Image Gallery Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {files.filter(file => isImageFile(file.name)).map((file, index) => (
              <div key={index} className="relative group overflow-hidden rounded-lg">
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="block">
                  <img 
                    src={file.url} 
                    alt={file.name} 
                    className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <ExternalLink className="text-white" size={24} />
                  </div>
                </a>
                <div className="mt-2 text-sm">
                  <p className="font-semibold truncate dark:text-gray-200">{file.name}</p>
                  <p className="text-gray-600 dark:text-gray-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Non-image files list */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Other Files</h3>
            <ul className="space-y-2">
              {files.filter(file => !isImageFile(file.name)).map((file, index) => (
                <li key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                  <span className="truncate flex-grow dark:text-gray-200">{file.name}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 mr-4">{formatFileSize(file.size)}</span>
                  <a href={file.url} download className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    <Button size="sm" className="dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Download</Button>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
