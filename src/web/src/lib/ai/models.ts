interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: "gpt-4o",
    name: "gpt-4o",
    description: "Chat completion",
  },
];
