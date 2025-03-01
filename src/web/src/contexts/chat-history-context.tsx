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
  updateChatTitleOptimistic: (id: string, newTitle: string) => void;
  deleteCurrentChat: () => Promise<void>;
  refreshChats: () => Promise<void>;
  saveNewChat: (id: string, firstMessage: string) => Promise<Chat>;
  deleteChatById: (id: string) => Promise<void>;
};

const ChatHistoryContext = createContext<ChatHistoryContextType | null>(null);

export function ChatHistoryProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat>();
  const [mounted, setMounted] = useState(false);

  const refreshChats = useCallback(async () => {
    if (!mounted) return;
    const allChats = await listChats();
    setChats(allChats.sort((a, b) => b.createdAt - a.createdAt));
  }, [mounted]);

  const createNewChat = () => {
    // Just set current chat to undefined to start a new temporary chat
    setCurrentChat(undefined);
  };

  const saveNewChat = async (id: string, firstMessage: string) => {
    if (!mounted) throw new Error("Cannot save chat before client-side initialization");
    const title = await generateTitle(firstMessage);
    const chat = await createChat(id, title);
    await refreshChats();
    setCurrentChat(chat);
    return chat;
  };

  const updateChatById = async (id: string, updates: Partial<Chat>) => {
    if (!mounted) return;

    // If we're updating the title, update the UI optimistically
    if (updates.title) {
      setChats((prevChats) => prevChats.map((chat) => (chat.id === id ? { ...chat, ...updates } : chat)));
    }

    // Update the database
    await updateChat(id, updates);

    // Refresh chats to ensure consistency with the database
    await refreshChats();
  };

  const updateChatTitleOptimistic = (id: string, newTitle: string) => {
    if (!mounted) return;
    setChats((prevChats) => prevChats.map((chat) => (chat.id === id ? { ...chat, title: newTitle } : chat)));
  };

  const deleteCurrentChat = async () => {
    if (!mounted) return;
    if (currentChat?.id) {
      await deleteChat(currentChat.id);
      setCurrentChat(undefined);
      await refreshChats();
    }
  };

  const deleteChatById = async (id: string) => {
    if (!mounted) return;
    await deleteChat(id);
    await refreshChats();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      refreshChats();
    }
  }, [refreshChats, mounted]);

  return (
    <ChatHistoryContext.Provider
      value={{
        chats,
        currentChat,
        setCurrentChat,
        createNewChat,
        updateChatById,
        updateChatTitleOptimistic,
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
