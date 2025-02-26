import React from "react";
import ChatContainer from "@/components/chat/chat-container";
import { generateId } from "ai";

export default function page() {
  const id = generateId();
  return <ChatContainer id={id} initialMessages={[]} />;
}
