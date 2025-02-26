"use client";
import React, { useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { ChatRequestOptions, Message } from "@ai-sdk/ui-utils";

import { toast } from "sonner";
import MessageList from "@/components/chat/message-list";
import UserPromptForm from "./user-prompt-form";
import { ChatHeader } from "./chat-header";
import { addMessageToChat } from "@/lib/db";
import ScrollToBottomButton from "./scroll-to-bottom";

export const MessagesContainer = ({
  scrollContainerRef,
  children,
}: {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) => {
  return (
    <div
      className="flex h-full min-h-16 flex-col overflow-y-auto"
      ref={scrollContainerRef}
    >
      <div className="flex-fill mx-auto flex h-full w-full max-w-screen-lg flex-col">
        {children}
      </div>
    </div>
  );
};

const apiErrorHandler = (
  apiError: Error,
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>,
) => {
  console.log("An error occurred:", apiError);
  toast(`An error occured`, {
    description: JSON.parse(apiError?.message ?? '{ message: "" }').message,
    duration: Infinity,
    action: {
      label: "Retry",
      onClick: () => {
        reload();
      },
    },
  });
};

export default function ChatContainer({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages?: Message[] | undefined;
}) {
  const {
    messages,
    input,
    handleInputChange,
    stop,
    status,
    reload,
    handleSubmit,
  } = useChat({
    id: id,
    api: process.env.NEXT_PUBLIC_CHAT_API_URL,
    initialMessages,
    onError: (apiError) => apiErrorHandler(apiError, reload),
    onFinish: async (message) => {
      await addMessageToChat(id, message);
    },
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <ChatHeader selectedModelId={"gpt-4o"} />

      <div className="flex-fill grid grid-rows-[1fr_auto] gap-4 overflow-auto py-4">
        <MessagesContainer scrollContainerRef={scrollContainerRef}>
          <MessageList messages={messages} />
        </MessagesContainer>

        <div className="mx-auto w-full max-w-screen-lg">
          <div className="mb-2 flex justify-center" style={{ height: "40px" }}>
            <ScrollToBottomButton
              status={status}
              messages={messages}
              scrollContainerRef={scrollContainerRef}
            />
          </div>
          <UserPromptForm
            input={input}
            handleSubmit={handleSubmit}
            status={status}
            stop={stop}
            handleChange={handleInputChange}
            chatId={id}
          />
        </div>
      </div>
    </>
  );
}
