import { openDB, type DBSchema } from "idb";
import { nanoid } from "nanoid";

export type ChatMessage = {
  id: string;
  role: "user" | "data" | "assistant" | "system";
  content: string;
  experimental_attachments?: Array<{
    name?: string;
    contentType?: string;
    url: string;
  }>;
};

export type Chat = {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
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

const dbPromise = openDB<ChatDB>("chat-app", 1, {
  upgrade(db) {
    const store = db.createObjectStore("chats", { keyPath: "id" });
    store.createIndex("by-created", "createdAt");
  },
});

export async function createChat(
  id: string,
  title = "New Chat",
): Promise<Chat> {
  const chat: Chat = {
    id,
    title,
    createdAt: Date.now(),
    messages: [],
  };

  const db = await dbPromise;
  await db.add("chats", chat);
  return chat;
}

export async function getChat(id: string): Promise<Chat | undefined> {
  const db = await dbPromise;
  return db.get("chats", id);
}

export async function updateChat(
  id: string,
  updates: Partial<Chat>,
): Promise<void> {
  const db = await dbPromise;
  const chat = await getChat(id);
  if (!chat) throw new Error("Chat not found");

  await db.put("chats", {
    ...chat,
    ...updates,
  });
}

export async function deleteChat(id: string): Promise<void> {
  const db = await dbPromise;
  await db.delete("chats", id);
}

export async function listChats(): Promise<Chat[]> {
  const db = await dbPromise;
  return db.getAllFromIndex("chats", "by-created");
}

export async function addMessageToChat(
  chatId: string,
  message: Omit<ChatMessage, "id">,
): Promise<void> {
  const chat = await getChat(chatId);
  if (!chat) throw new Error("Chat not found");

  const newMessage: ChatMessage = {
    ...message,
    id: nanoid(),
  };

  await updateChat(chatId, {
    messages: [...chat.messages, newMessage],
  });
}
