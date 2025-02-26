import { Button } from "../ui/button";
import { handleSignIn } from "./actions/signin-action";

export function SignIn() {
  return (
    <form action={handleSignIn}>
      <Button type="submit" className="w-full">
        Sign In
      </Button>
    </form>
  );
}
