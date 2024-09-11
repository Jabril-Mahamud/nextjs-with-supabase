'use client';

import React from 'react';
import FileList from '@/components/file-stuff/FileList'; // Ensure the correct path to your FileList component

const Page = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Uploaded Files</h1>
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        <FileList />
      </div>
    </div>
  );
};

export default Page;
