import { signOutAction } from "@/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogIn, UserPlus, LogOut } from "lucide-react"; // Import lucide icons

export default async function AuthButton() {
  const {
    data: { user },
  } = await createClient().auth.getUser();

  if (!hasEnvVars) {
    return (
      <div className="flex gap-4 items-center">
        <Badge variant="default" className="font-normal pointer-events-none">
          Please update .env.local file with anon key and url
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="opacity-75 cursor-none pointer-events-none"
            >
              Account
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled>Sign in</DropdownMenuItem>
            <DropdownMenuItem disabled>Sign up</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {user ? `Hey, ${user.email}!` : "Account"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {user ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <User size={16} /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <form action={signOutAction}>
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full justify-start flex items-center gap-2"
                >
                  <LogOut size={16} /> Sign out
                </Button>
              </form>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href="/sign-in" className="flex items-center gap-2">
                <LogIn size={16} /> Sign in
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/sign-up" className="flex items-center gap-2">
                <UserPlus size={16} /> Sign up
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
