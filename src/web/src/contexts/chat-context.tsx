"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { ChatRequestOptions, Message } from "@ai-sdk/ui-utils";
import { toast } from "sonner";
import { addMessageToChat, getChat } from "@/lib/db";
import { useParams, useRouter } from "next/navigation";
import { useChatHistoryContext } from "./chat-history-context";

interface ChatContextProps {
  id: string;
  selectedChatModel: string;
  messages: Message[];
  updateMessage: (messageId: string, content: string) => Promise<void>;
  setMessages: (messages: Message[] | ((messages: Message[]) => Message[])) => void;
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  stop: () => void;
  status: "streaming" | "error" | "submitted" | "ready";
  reload: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error: Error | undefined;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatContextProvider: React.FC<{ id: string; selectedChatModel: string; children: React.ReactNode }> = ({
  id,
  selectedChatModel,
  children,
}) => {
  const { updateChatById } = useChatHistoryContext();

  const [initialMessages, setInitialMessages] = useState<Message[] | undefined>(undefined);
  const { id: chatIdParam } = useParams();
  const router = useRouter();

  const { messages, setMessages, input, handleInputChange, stop, status, reload, handleSubmit, error } = useChat({
    id: id,
    body: { id, selectedChatModel: selectedChatModel },
    initialMessages,
    onError: (apiError) => apiErrorHandler(apiError),
    onFinish: async (message) => {
      await addMessageToChat(id, message);
    },
  });

  const updateMessage = async (messageId: string, content: string) => {
    const index = messages.findIndex((m) => m.id === messageId);

    if (index !== -1) {
      const updatedMessage = {
        ...messages[index],
        content: content,
      };

      const updatedMessages = [...messages.slice(0, index), updatedMessage];

      await updateChatById(id, { messages: updatedMessages });

      setMessages(updatedMessages);
    }
  };

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

  return (
    <ChatContext.Provider
      value={{
        id,
        selectedChatModel,
        messages,
        setMessages,
        updateMessage,
        input,
        handleInputChange,
        stop,
        status,
        reload,
        handleSubmit,
        error,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

const apiErrorHandler = (apiError: Error) => {
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
    // duration: Infinity,
    // action: {
    //   label: "Retry",
    //   onClick: () => {
    //     reload();
    //   },
    // },
  });
};
