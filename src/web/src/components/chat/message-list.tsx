import React from "react";
import { Message } from "ai";
import { AnimatePresence, motion } from "framer-motion";

import MarkdownRenderer from "@/components/markdown-renderer";
import { cn } from "@/lib/utils";
import MessageUser from "./message-user";

export type MessageListProps = {
  messages: Message[];
};

const AssistantMessage = ({ content }: { content: string }) => <MarkdownRenderer>{content}</MarkdownRenderer>;

const MessageList = ({ messages }: MessageListProps) => {
  return (
    <div className="flex-fill flex flex-col gap-8">
      {messages.map((message) => (
        <AnimatePresence key={message.id}>
          <motion.div
            className="group/message w-full"
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            data-role={message.role}
          >
            <div
              key={message.id}
              className={cn(`flex flex-col gap-2`, message.role === "user" ? "items-end" : "items-start")}
            >
              {message.role === "user" ? (
                <MessageUser message={message} />
              ) : (
                <AssistantMessage content={message.content} />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      ))}
    </div>
  );
};

export default MessageList;
