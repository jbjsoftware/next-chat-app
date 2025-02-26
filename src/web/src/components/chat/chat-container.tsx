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
    error,
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

  //when a new message from the user is added, scroll to the bottom
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      if (messages[messages.length - 1]?.role === "user") {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: "auto",
        });
      }
    }
  }, [messages]);

  return (
    <>
      <ChatHeader selectedModelId={"gpt-4o"} />

      <div className="flex-fill grid grid-rows-[1fr_auto] gap-4 overflow-auto py-4">
        <MessagesContainer scrollContainerRef={scrollContainerRef}>
          <MessageList messages={messages} />
        </MessagesContainer>

        <div className="mx-auto w-full max-w-screen-lg">
          <div className="flex-fill flex w-full items-center">
            <div>
              {status === "streaming" && (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500"></div>
                  <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500 delay-200"></div>
                  <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500 delay-400"></div>
                </div>
              )}
            </div>

            <div
              className="flex-fill flex justify-end"
              style={{ height: "40px" }}
            >
              <ScrollToBottomButton
                status={status}
                messages={messages}
                scrollContainerRef={scrollContainerRef}
              />
            </div>
          </div>
          <UserPromptForm
            input={input}
            handleSubmit={handleSubmit}
            status={status}
            stop={stop}
            handleChange={handleInputChange}
            chatId={id}
            error={error}
            reload={reload}
          />
        </div>
      </div>
    </>
  );
}
