'use client';

import React from 'react';
import FileList from '@/components/file-stuff/fileList'; // Ensure the correct path to your FileList component

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-start w-full p-4">
      {/* Title Section */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold">Your Uploaded Files</h1>
      </div>

      {/* Buttons Section */}
      <div className="mb-6">
        {/* Add your buttons here if you have any */}
      </div>

      {/* FileList Section */}
      <div className="w-full">
        <FileList />
      </div>
    </div>
  );
};

export default Page;



