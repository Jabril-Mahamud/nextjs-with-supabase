import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ProtectedPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }

  const relevantUserInfo = [
    { key: 'ID', value: user.id },
    { key: 'Email', value: user.email },
    { key: 'Full Name', value: user.user_metadata?.full_name || 'Not provided' },
    { key: 'Created At', value: new Date(user.created_at).toLocaleString() },
    { key: 'Last Sign In', value: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A' },
  ];

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Profile page</h2>
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Field</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relevantUserInfo.map((item) => (
                <TableRow key={item.key}>
                  <TableCell className="font-medium">{item.key}</TableCell>
                  <TableCell className="break-all">{item.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}