import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import Link from "next/link";
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Function to flatten nested objects
  const flattenObject = (obj, prefix = '') => {
    return Object.keys(obj).reduce((acc, k) => {
      const pre = prefix.length ? `${prefix}.` : '';
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        Object.assign(acc, flattenObject(obj[k], pre + k));
      } else {
        acc[pre + k] = obj[k] === null ? 'null' : 
                       Array.isArray(obj[k]) ? JSON.stringify(obj[k]) : 
                       obj[k].toString();
      }
      return acc;
    }, {});
  };

  const flatUserData = flattenObject(user);
  const userDataForTable = Object.entries(flatUserData).map(([key, value]) => ({ key, value }));

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Field</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userDataForTable.map((item) => (
                <TableRow key={item.key}>
                  <TableCell className="font-medium">{item.key}</TableCell>
                  <TableCell className="break-all">{item.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">Next steps</h2>
        <p>Get started with the nextjs supabase app</p>
      </div>
    </div>
  );
}