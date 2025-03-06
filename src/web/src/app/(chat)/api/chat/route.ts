import { getMostRecentUserMessage } from "@/lib/utils";
import { type Message, smoothStream, streamText } from "ai";
import { Attachment } from "@/components/chat/attachment-preview";

import { myProvider } from "@/lib/ai/models";

export const maxDuration = 60;

type RequestBody = {
  messages: Array<Message>;
  selectedChatModel: string;
  attachments?: Attachment[];
};

export async function POST(request: Request) {
  const { messages, selectedChatModel, attachments }: RequestBody = await request.json();

  const userMessage = getMostRecentUserMessage(messages);

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  // Include information about attachments in the system message if there are any
  let systemMessage = "You are a helpful assistant.";
  if (attachments && attachments.length > 0) {
    const attachmentInfo = attachments
      .map((attachment) => {
        if (attachment.type === "text" && attachment.content) {
          return `- Text file "${attachment.name}" with content: ${attachment.content}`;
        } else {
          return `- ${attachment.type.charAt(0).toUpperCase() + attachment.type.slice(1)} file "${attachment.name}"`;
        }
      })
      .join("\n");

    systemMessage += `\nThe user has shared the following files with you:\n${attachmentInfo}\n\nPlease reference these files in your response when appropriate.`;
  }

  const result = streamText({
    model: myProvider.languageModel(selectedChatModel),
    system: systemMessage,
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
