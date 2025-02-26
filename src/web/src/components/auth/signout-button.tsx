import { Button } from "../ui/button";
import { handleSignOut } from "./actions/signout-action";

export function SignOut() {
  return (
    <form action={handleSignOut}>
      <Button type="submit" className="w-full">
        Sign Out
      </Button>
    </form>
  );
}
