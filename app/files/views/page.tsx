'use client';

import React from 'react';
import FileList from '@/components/file-stuff/FileList'; // Ensure the correct path to your FileList component

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 ">
      <h1 className="text-3xl font-bold mb-8">Your Uploaded Files</h1>
      <div className="w-full max-w-4xl border shadow-lg rounded-lg p-6 bg-white">
        <FileList />
      </div>
    </div>
  );
};

export default Page;


