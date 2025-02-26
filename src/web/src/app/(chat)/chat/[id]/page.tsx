"use client";
import ChatContainer from "@/components/chat/chat-container";
import { Chat, getChat } from "@/lib/db";
import { useParams, useRouter } from "next/navigation";

import React, { useEffect } from "react";

export default function Page() {
  const { id } = useParams();
  const [chat, setChat] = React.useState<Chat | undefined>(undefined);

  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const chat = await getChat(id as string);
      if (!chat) {
        router.push("/");
        return;
      }
      setChat(chat);
    }
    fetchData();
  }, [id, router]);

  if (!id) {
    return <div>Chat not found</div>;
  }

  return <ChatContainer id={id as string} initialMessages={chat?.messages} />;
}
