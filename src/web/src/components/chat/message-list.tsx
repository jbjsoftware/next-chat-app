import React from "react";
import { Message } from "ai";
import { AnimatePresence, motion } from "framer-motion";

import MarkdownRenderer from "@/components/markdown-renderer";
import { cn } from "@/lib/utils";
import MessageUser from "./message-user";
import { AttachmentCards } from "./attachments";

export type MessageListProps = {
  messages: Message[];
};

const AssistantMessage = ({ content }: { content: string }) => <MarkdownRenderer>{content}</MarkdownRenderer>;

const MessageList = ({ messages }: MessageListProps) => {
  return (
    <div className="flex-fill flex flex-col gap-4.5">
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
                <>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mb-1 ml-4 md:ml-12">
                      <AttachmentCards attachments={message.attachments} isUserMessage={false} />
                    </div>
                  )}
                  <AssistantMessage content={message.content} />
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      ))}
    </div>
  );
};

export default MessageList;
