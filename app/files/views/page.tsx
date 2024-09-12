'use client';

import React from 'react';
import FileList from '@/components/file-stuff/FileList'; // Ensure the correct path to your FileList component

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 ">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Your Uploaded Files</h1>
      <div className="w-full max-w-3xl border shadow-md rounded-lg p-4 bg-white">
        <FileList />
      </div>
    </div>
  );
};

export default Page;


