"use client";
import React from "react";
import { useChat } from "@ai-sdk/react";

import { toast } from "sonner";
import MessageList from "@/components/chat/MessageList";
import UserPromptForm from "./UserPromptForm";
import { ChatRequestOptions } from "@ai-sdk/ui-utils";

const MessagesContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
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

export default function ChatContainer() {
  const chatProps = useChat({
    id: "chat",
    api: process.env.NEXT_PUBLIC_CHAT_API_URL,
    onError: (apiError) => apiErrorHandler(apiError, chatProps.reload),
  });

  return (
    <div className="flex-fill grid grid-rows-[1fr_auto] gap-4 overflow-auto py-4">
      <MessagesContainer>
        <MessageList messages={chatProps.messages} />
      </MessagesContainer>

      <div className="mx-auto w-full max-w-screen-lg">
        <UserPromptForm
          input={chatProps.input}
          handleSubmit={chatProps.handleSubmit}
          status={chatProps.status}
          stop={chatProps.stop}
          handleChange={chatProps.handleInputChange}
        />
      </div>
    </div>
  );
}
