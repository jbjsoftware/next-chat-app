"use client";
import React, { useEffect, useRef } from "react";

import { useChatContext } from "@/contexts/chat-context";
import UserPromptForm from "@/components/chat/user-prompt-form";
import { ChatHeader } from "@/components/chat/chat-header";
import ScrollToBottomButton from "@/components/chat/scroll-to-bottom";
import MessageList from "@/components/chat/message-list";
import { useUserPreferencesContext } from "@/contexts/user-preferences-context";

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

export default function ChatContainer() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { autoScroll } = useUserPreferencesContext();
  const { messages, status, selectedChatModel } = useChatContext();

  useEffect(() => {
    const scrollOnNewUserMessage = () => {
      if (scrollContainerRef.current) {
        if (messages[messages.length - 1]?.role === "user" || autoScroll) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: "auto",
          });
        }
      }
    };
    scrollOnNewUserMessage();
  }, [messages, autoScroll]);

  return (
    <>
      <ChatHeader selectedModelId={selectedChatModel} />

      <div className="flex-fill grid grid-rows-[1fr_auto] gap-4 overflow-auto px-8 pt-3 pb-2">
        <MessagesContainer scrollContainerRef={scrollContainerRef}>
          <MessageList messages={messages} />
        </MessagesContainer>

        <div className="mx-auto w-full max-w-screen-lg">
          <div className="flex-fill flex w-full items-center">
            <div>
              {(status === "streaming" || status === "submitted") && (
                <div className="flex items-center justify-center gap-1">
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

          <UserPromptForm />
        </div>
      </div>
    </>
  );
}
