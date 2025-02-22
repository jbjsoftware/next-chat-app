import Chat from "@/components/Chat";
import { ModeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BrainCog, User } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col">
      <div className="flex items-center px-4 py-2 gap-2">
        <BrainCog />

        <h1 className="text-2xl font-bold hidden md:block">Chat</h1>

        <div className="flex-fill"></div>

        <div className="flex items-center">
          <ModeToggle />
        </div>

        <Avatar>
          <AvatarFallback className="bg-slate-700 text-white p-1">
            <User />
          </AvatarFallback>
        </Avatar>
      </div>
      <Chat />
    </main>
  );
}
