'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Download, X, Upload } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import Masonry from 'react-masonry-css';

interface FileInfo {
  name: string;
  url: string;
  createdAt: string;
  size: number;
}

const Page = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
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

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  return (
    <div className="flex flex-col items-center justify-start w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="w-full bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">Your Files</h1>
            <div className="flex space-x-4">
              <Button 
                onClick={downloadAllFiles} 
                disabled={isDownloading}
                className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 flex items-center gap-2"
              >
                <Download size={16} />
                {isDownloading ? 'Downloading...' : 'Download All'}
              </Button>
              <Link href="/files">
                <Button className="bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 flex items-center gap-2">
                  <Upload size={16} />
                  Upload Files
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && <p className="text-center text-gray-600 dark:text-gray-300">Loading files...</p>}
        {errorMessage && <p className="text-center text-red-500 dark:text-red-400">{errorMessage}</p>}
        {!loading && files.length === 0 && (
          <p className="text-center text-gray-600 dark:text-gray-300">No files uploaded yet.</p>
        )}
        {!loading && files.length > 0 && (
          <div>
            {isDownloading && (
              <div className="w-full max-w-xs mx-auto mb-6">
                <Progress value={downloadProgress} className="w-full" />
                <p className="text-center mt-2 text-gray-600 dark:text-gray-300">{`${Math.round(downloadProgress)}% Complete`}</p>
              </div>
            )}
            
            {/* Image Gallery */}
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Image Gallery</h2>
              <Masonry
                breakpointCols={breakpointColumnsObj}
                className="flex w-auto -ml-4"
                columnClassName="pl-4 bg-clip-padding"
              >
                {files.filter(file => isImageFile(file.name)).map((file, index) => (
                  <div key={index} className="mb-4">
                    <div 
                      className="relative overflow-hidden rounded-lg shadow-lg cursor-pointer transform transition-transform duration-300 hover:scale-105"
                      onClick={() => setLightboxImage(file.url)}
                    >
                      <img 
                        src={file.url} 
                        alt={file.name} 
                        className="w-full h-auto object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
                        <p className="text-white text-center opacity-0 hover:opacity-100 transition-opacity duration-300 px-2">
                          {file.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </Masonry>
            </div>

            {/* Non-image files list */}
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Other Files</h2>
              <ul className="space-y-2">
                {files.filter(file => !isImageFile(file.name)).map((file, index) => (
                  <li key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm">
                    <span className="truncate flex-grow text-gray-700 dark:text-gray-200">{file.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-4">{formatFileSize(file.size)}</span>
                    <a href={file.url} download className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                      <Button size="sm" variant="outline" className="dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">Download</Button>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <img 
              src={lightboxImage} 
              alt="Enlarged view" 
              className="w-full h-full object-contain"
            />
            <button 
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;