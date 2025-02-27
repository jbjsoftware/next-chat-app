"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Cpu, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";
import { useChatHistoryContext } from "@/contexts/chat-history-context";
import { ChatHistory } from "./chat/chat-history";
import { SignIn } from "./auth/signin-button";
import { SidebarUserNav } from "./sidebar-user-nav";

const NewChatButton = ({ handleOnClick }: { handleOnClick: () => void }) => {
  return (
    <Button
      type="button"
      variant="outline"
      className="mb-4 w-full items-center justify-center gap-2 rounded-none"
      onClick={handleOnClick}
    >
      <span className="hidden md:block">New Chat</span>
      <Plus />
    </Button>
  );
};

export default function AppSidebar() {
  const { createNewChat } = useChatHistoryContext();
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
        <NewChatButton handleOnClick={handleCreateNewChat} />

        <div className="w-full flex-1 truncate overflow-auto">
          <ChatHistory />
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        {!session?.user && (
          <div className="mb-2">
            <SignIn />
          </div>
        )}
        {session?.user && <SidebarUserNav />}
      </SidebarFooter>
    </Sidebar>
  );
}
