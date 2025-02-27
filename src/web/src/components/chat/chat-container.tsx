"use client";
import React, { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { ChatRequestOptions, Message } from "@ai-sdk/ui-utils";

import { toast } from "sonner";
import MessageList from "@/components/chat/message-list";
import UserPromptForm from "./user-prompt-form";
import { ChatHeader } from "./chat-header";
import { addMessageToChat, getChat } from "@/lib/db";
import ScrollToBottomButton from "./scroll-to-bottom";
import { useParams, useRouter } from "next/navigation";

export const MessagesContainer = ({
  scrollContainerRef,
  children,
}: {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex h-full min-h-16 flex-col overflow-y-auto" ref={scrollContainerRef}>
      <div className="flex-fill mx-auto flex h-full w-full max-w-screen-lg flex-col">{children}</div>
    </div>
  );
};

const apiErrorHandler = (
  apiError: Error,
  reload: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>,
) => {
  console.log("An error occurred:", apiError);
  const errorMessage = () => {
    try {
      return JSON.parse(apiError?.message ?? '{ message: "" }').message;
    } catch {
      return apiError?.message || "An unknown error occurred";
    }
  };

  toast(`An error occured`, {
    description: errorMessage(),
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
  selectedChatModel,
}: {
  id: string;
  initialMessages?: Message[] | undefined;
  selectedChatModel: string;
}) {
  const [initialMessages, setInitialMessages] = React.useState<Message[] | undefined>(undefined);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { id: chatIdParam } = useParams();
  const router = useRouter();

  const { messages, input, handleInputChange, stop, status, reload, handleSubmit, error } = useChat({
    id: id,
    body: { id, selectedChatModel: selectedChatModel },
    initialMessages,
    onError: (apiError) => apiErrorHandler(apiError, reload),
    onFinish: async (message) => {
      await addMessageToChat(id, message);
    },
  });

  useEffect(() => {
    async function fetchSavedMessages() {
      const chat = await getChat(id as string);
      if (chatIdParam && ((chatIdParam && !chat) || chatIdParam !== id)) {
        router.push("/");
        return;
      }
      setInitialMessages(chat?.messages);
    }

    fetchSavedMessages();
  }, [id, router, chatIdParam]);

  useEffect(() => {
    const scrollOnNewUserMessage = () => {
      if (scrollContainerRef.current) {
        if (messages[messages.length - 1]?.role === "user") {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: "auto",
          });
        }
      }
    };
    scrollOnNewUserMessage();
  }, [messages]);

  return (
    <>
      <ChatHeader selectedModelId={selectedChatModel} />

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

            <div className="flex-fill flex justify-end" style={{ height: "40px" }}>
              <ScrollToBottomButton status={status} messages={messages} scrollContainerRef={scrollContainerRef} />
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
