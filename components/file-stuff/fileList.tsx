'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ExternalLink } from 'lucide-react';

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

  const isImageFile = (fileName: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  const downloadAllFiles = () => {
    files.forEach(file => {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.click();
    });
  };

  return (
    <div className="p-4">
      {loading && <p className="text-center ">Loading files...</p>}
      {errorMessage && <p className="text-center text-red-500">{errorMessage}</p>}
      {!loading && files.length === 0 && (
        <p className="text-center ">No files uploaded yet.</p>
      )}
      {!loading && files.length > 0 && (
        <div>
          <div className="mb-6 flex justify-center gap-4">
            <Button onClick={downloadAllFiles} className="bg-blue-500 text-white hover:bg-blue-600">Download All</Button>
            <Button as="a" href="/upload" className="bg-green-500 text-white hover:bg-green-600">Upload Page</Button>
          </div>
          {/* Carousel for displaying images */}
          <div className="flex justify-center mb-8">
            <Carousel className="w-full max-w-screen-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
              <CarouselContent>
                {files.filter(file => isImageFile(file.name)).map((file, index) => (
                  <CarouselItem key={index} className="relative flex items-center justify-center">
                    <div className="relative">
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <img src={file.url} alt={file.name} className="w-full h-auto object-cover aspect-square rounded-md" />
                      </a>
                      <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white text-sm p-2 w-full text-center">
                        {file.name}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="absolute inset-y-0 left-0 flex items-center">
                <CarouselPrevious className="bg-gray-800 text-white hover:bg-gray-700" />
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center">
                <CarouselNext className="bg-gray-800 text-white hover:bg-gray-700" />
              </div>
            </Carousel>
          </div>
        </div>
      )}
    </div>
  );
}
