"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { ChatRequestOptions, Message } from "@ai-sdk/ui-utils";
import { toast } from "sonner";
import { addMessageToChat, getChat } from "@/lib/db";
import { useParams, useRouter } from "next/navigation";
import { useChatHistoryContext } from "./chat-history-context";
import { Attachment } from "@/components/chat/attachment-preview";

// Extend the Message type to include attachments
declare module "@ai-sdk/ui-utils" {
  interface Message {
    attachments?: Attachment[];
  }
}

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
  attachments: Attachment[];
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatContextProvider: React.FC<{ id: string; selectedChatModel: string; children: React.ReactNode }> = ({
  id,
  selectedChatModel,
  children,
}) => {
  const { updateChatById } = useChatHistoryContext();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [initialMessages, setInitialMessages] = useState<Message[] | undefined>(undefined);
  const { id: chatIdParam } = useParams();
  const router = useRouter();

  const { messages, setMessages, input, handleInputChange, stop, status, reload, handleSubmit, error } = useChat({
    id: id,
    body: {
      id,
      selectedChatModel: selectedChatModel,
      attachments,
    },
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
        attachments,
        setAttachments,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatContextProvider");
  }
  return context;
};

const apiErrorHandler = (apiError: Error) => {
  console.error(apiError);

  const errorMessage = () => {
    if (apiError.message) {
      return apiError.message;
    }
    return "An error occurred while sending your message";
  };

  toast.error(errorMessage());
};
