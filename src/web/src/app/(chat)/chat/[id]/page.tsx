import ChatContainer from "@/components/chat/chat-container";
import { ChatContextProvider } from "@/contexts/chat-context";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import React from "react";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");

  if (!id) {
    return redirect("/");
  }

  return (
    <ChatContextProvider id={id as string} selectedChatModel={modelIdFromCookie?.value ?? DEFAULT_CHAT_MODEL}>
      <ChatContainer />
    </ChatContextProvider>
  );
}
