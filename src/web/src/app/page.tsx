import ChatContainer from "@/components/chat/ChatContainer";
import { ModeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BrainCog, User } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <div className="flex items-center gap-2 px-4 py-2">
        <BrainCog />

        <h1 className="hidden text-2xl font-bold md:block">Chat</h1>

        <div className="flex-fill"></div>

        <div className="flex items-center">
          <ModeToggle />
        </div>

        <Avatar className="cursor-pointer">
          <AvatarFallback className="bg-slate-700 text-white">
            <User />
          </AvatarFallback>
        </Avatar>
      </div>
      <ChatContainer />
    </main>
  );
}
