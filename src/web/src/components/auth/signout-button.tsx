import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { handleSignOut } from "./actions/signout-action";

export function SignOut() {
  return (
    <form action={handleSignOut}>
      <Button type="submit" className="w-full">
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </form>
  );
}
