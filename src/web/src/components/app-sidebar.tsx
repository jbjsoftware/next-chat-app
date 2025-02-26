"use client";
import { Cpu, Plus } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useChatContext } from "@/contexts/chat-context";
import { ChatHistory } from "./chat/chat-history";
import { useRouter } from "next/navigation";
import { SignIn } from "./auth/signin-button";
import { useSession } from "next-auth/react";
import { SidebarUserNav } from "./sidebar-user-nav";

export default function AppSidebar() {
  const { createNewChat } = useChatContext();
  const router = useRouter();
  const { data: session } = useSession();

  const handleCreateNewChat = () => {
    createNewChat();
    router.push("/");
  };
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 py-1">
          <Cpu />
          <h1 className="text-xl font-bold">ChatBot</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <Button
          variant="outline"
          className="mb-4 w-full items-center justify-center gap-2 rounded-none"
          onClick={handleCreateNewChat}
        >
          <span className="hidden md:block">New Chat</span>
          <Plus />
        </Button>

        <div className="w-full flex-1 truncate overflow-auto">
          <ChatHistory />
        </div>
      </SidebarContent>
      <SidebarFooter>
        {!session?.user && (
          <div className="mb-2">
            <SignIn />
          </div>
        )}
        {session?.user && <SidebarUserNav user={session.user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
