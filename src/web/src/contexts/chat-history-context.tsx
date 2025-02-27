"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { type Chat, createChat, listChats, updateChat, deleteChat } from "@/lib/db";
import { generateTitle } from "@/lib/utils";

type ChatHistoryContextType = {
  chats: Chat[];
  currentChat?: Chat;
  setCurrentChat: (chat: Chat | undefined) => void;
  createNewChat: () => void;
  updateChatById: (id: string, updates: Partial<Chat>) => Promise<void>;
  deleteCurrentChat: () => Promise<void>;
  refreshChats: () => Promise<void>;
  saveNewChat: (id: string, firstMessage: string) => Promise<Chat>;
  deleteChatById: (id: string) => Promise<void>;
};

const ChatHistoryContext = createContext<ChatHistoryContextType | null>(null);

export function ChatHistoryProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat>();

  const refreshChats = useCallback(async () => {
    const allChats = await listChats();
    setChats(allChats.sort((a, b) => b.createdAt - a.createdAt));
  }, []);

  const createNewChat = () => {
    // Just set current chat to undefined to start a new temporary chat
    setCurrentChat(undefined);
  };

  const saveNewChat = async (id: string, firstMessage: string) => {
    const title = await generateTitle(firstMessage);
    const chat = await createChat(id, title);
    await refreshChats();
    setCurrentChat(chat);
    return chat;
  };

  const updateChatById = async (id: string, updates: Partial<Chat>) => {
    await updateChat(id, updates);
    await refreshChats();
  };

  const deleteCurrentChat = async () => {
    if (currentChat?.id) {
      await deleteChat(currentChat.id);
      setCurrentChat(undefined);
      await refreshChats();
    }
  };

  const deleteChatById = async (id: string) => {
    await deleteChat(id);
    await refreshChats();
  };

  useEffect(() => {
    refreshChats();
  }, [refreshChats]);

  return (
    <ChatHistoryContext.Provider
      value={{
        chats,
        currentChat,
        setCurrentChat,
        createNewChat,
        updateChatById,
        deleteCurrentChat,
        refreshChats,
        saveNewChat,
        deleteChatById,
      }}
    >
      {children}
    </ChatHistoryContext.Provider>
  );
}

export function useChatHistoryContext() {
  const context = useContext(ChatHistoryContext);
  if (!context) throw new Error("useChatHistoryContext must be used within a ChatHistoryProvider");
  return context;
}
