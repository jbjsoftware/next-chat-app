import React from "react";
import ChatContainer from "@/components/chat/chat-container";
import { generateId } from "ai";
import { cookies } from "next/headers";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";

export default async function page() {
  const id = generateId();
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");

  return <ChatContainer id={id} selectedChatModel={modelIdFromCookie?.value ?? DEFAULT_CHAT_MODEL} />;
}
