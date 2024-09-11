'use client';

import React from 'react';
import FileList from '@/components/file-stuff/FileList'; // Ensure the correct path to your FileList component

const Page = () => {
  return (
    <div>
      <h1>Your Uploaded Files</h1>
      <FileList />
    </div>
  );
};

export default Page;
