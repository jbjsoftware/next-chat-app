import { Message } from "ai";
import { openDB, type DBSchema } from "idb";
import { nanoid } from "nanoid";
import { Attachment } from "@/components/chat/attachment-preview";

// Extend the Message type to include attachments
declare module "ai" {
  interface Message {
    attachments?: Attachment[];
  }
}

export type Chat = {
  id: string;
  title: string;
  createdAt: number;
  messages: Message[];
};

interface ChatDB extends DBSchema {
  chats: {
    key: string;
    value: Chat;
    indexes: {
      "by-created": number;
    };
  };
}

function assertClientSide() {
  if (typeof window === "undefined") {
    throw new Error("Database operations can only be performed on the client side");
  }
}

const getDB = () => {
  assertClientSide();
  return openDB<ChatDB>("chat-app", 1, {
    upgrade(db) {
      const store = db.createObjectStore("chats", { keyPath: "id" });
      store.createIndex("by-created", "createdAt");
    },
  });
};

export async function createChat(id: string, title = "New Chat"): Promise<Chat> {
  const chat: Chat = {
    id,
    title,
    createdAt: Date.now(),
    messages: [],
  };

  const db = await getDB();
  await db.add("chats", chat);
  return chat;
}

export async function getChat(id: string): Promise<Chat | undefined> {
  const db = await getDB();
  return db.get("chats", id);
}

export async function updateChat(id: string, updates: Partial<Chat>): Promise<void> {
  const db = await getDB();
  const chat = await getChat(id);
  if (!chat) throw new Error("Chat not found");

  await db.put("chats", {
    ...chat,
    ...updates,
  });
}

export async function deleteChat(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("chats", id);
}

export async function listChats(): Promise<Chat[]> {
  const db = await getDB();
  return db.getAllFromIndex("chats", "by-created");
}

export async function addMessageToChat(chatId: string, message: Omit<Message, "id">): Promise<void> {
  const chat = await getChat(chatId);
  if (!chat) throw new Error("Chat not found");

  const newMessage: Message = {
    ...message,
    id: nanoid(),
  };

  await updateChat(chatId, {
    messages: [...chat.messages, newMessage],
  });
}
