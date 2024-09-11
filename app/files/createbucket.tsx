import { useState } from 'react';
import { createClient } from '../utils/supabase/client';

const createBucket = async (bucketName: string) => {
    const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase.storage.createBucket(bucketName);

  if (error) {
    console.error('Error creating bucket:', error.message);
  } else {
    console.log('Bucket created successfully:', data);
  }
};

// Call the function to create a bucket
createBucket('my-new-bucket');
