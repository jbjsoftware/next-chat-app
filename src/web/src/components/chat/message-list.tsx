import React from "react";
import MarkdownRenderer from "@/components/markdown-renderer";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type MessageListProps = {
  messages: any[];
};

const UserMessage = ({ content }: { content: string }) => (
  <Card className="ml-4 rounded-3xl rounded-br-xs px-4 py-2 md:ml-64">{content}</Card>
);

const AssistantMessage = ({ content }: { content: string }) => <MarkdownRenderer>{content}</MarkdownRenderer>;

const MessageList = ({ messages }: MessageListProps) => {
  return (
    <div className="flex-fill flex flex-col gap-8">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(`flex flex-col gap-2`, message.role === "user" ? "items-end" : "items-start")}
        >
          {message.role === "user" ? (
            <UserMessage content={message.content} />
          ) : (
            <AssistantMessage content={message.content} />
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
