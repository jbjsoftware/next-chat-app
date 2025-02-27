import AppSidebar from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChatHistoryProvider } from "@/contexts/chat-history-context";
import React from "react";

export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ChatHistoryProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </ChatHistoryProvider>
  );
}
