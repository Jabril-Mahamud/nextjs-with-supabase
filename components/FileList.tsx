import { createClient } from "@/utils/supabase/server";
import FileUpload from './FileUpload';  // Assuming FileUpload is in the same directory

export default async function FileList() {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return <div>Please sign in to view and upload files.</div>;
  }

  const { data, error } = await supabase.storage.from('user-uploads').list(user.id);
  
  if (error) {
    console.error('Error fetching files:', error);
    return <div>Error loading files</div>;
  }

  const files = data.map(file => file.name);

  return (
    <div>
      <h2 className="font-bold text-2xl mb-4">Your Files</h2>
      {files.length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (
        <ul className="list-disc pl-5">
          {files.map((file) => (
            <li key={file} className="mb-2">
              <a
                href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/user-uploads/${user.id}/${encodeURIComponent(file)}`}
                download
                className="text-blue-600 hover:underline"
              >
                {file}
              </a>
            </li>
          ))}
        </ul>
      )}
      <FileUpload />
    </div>
  );
}