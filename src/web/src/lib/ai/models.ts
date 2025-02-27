import { azure } from "@ai-sdk/azure";
import { customProvider } from "ai";

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const myProvider = customProvider({
  languageModels: {
    "gpt-4": azure("gpt-4"),
  },
});

export const chatModels: Array<ChatModel> = [
  {
    id: "gpt-4",
    name: "gpt-4o",
    description: "Chat completion",
  },
];

export const DEFAULT_CHAT_MODEL: string = chatModels[0].id;
