import { getMostRecentUserMessage } from "@/lib/utils";
import { type Message, smoothStream, streamText } from "ai";

import { myProvider } from "@/lib/ai/models";

export const maxDuration = 60;

type RequestBody = {
  messages: Array<Message>;
  selectedChatModel: string;
};

export async function POST(request: Request) {
  const { messages, selectedChatModel }: RequestBody = await request.json();

  const userMessage = getMostRecentUserMessage(messages);

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  const result = streamText({
    model: myProvider.languageModel(selectedChatModel),
    system: "You are a helpful assistant.",
    messages,
    experimental_transform: smoothStream({ chunking: "word" }),
  });

  return result.toDataStreamResponse({
    getErrorMessage: (error) => {
      if (error == null) {
        return "unknown error";
      }

      if (typeof error === "string") {
        return error;
      }

      if (error instanceof Error) {
        return error.message;
      }
      return JSON.stringify(error);
    },
  });
}
