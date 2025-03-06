import React, { useState } from "react";
import { Message } from "ai";
import { CopyIcon, PencilIcon } from "lucide-react";

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageEditor } from "./message-editor";
import { AttachmentCards } from "./attachments";

export type UserMessageProps = {
  message: Message;
};

const CopyMessageButton = ({ message }: { message: Message }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full text-muted-foreground" onClick={handleCopy}>
          <CopyIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Copy</TooltipContent>
    </Tooltip>
  );
};

export default function UserMessage({ message }: UserMessageProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");

  return (
    <>
      {mode === "view" && (
        <div className="ml-4 flex flex-col items-end gap-1 md:ml-64">
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-1">
              <AttachmentCards attachments={message.attachments} isUserMessage={true} />
            </div>
          )}

          <Card className="rounded-3xl rounded-br-xs px-4 py-2">{message.content}</Card>

          <div className="mr-2 flex flex-row gap-2 opacity-0 group-hover/message:opacity-100">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full text-muted-foreground"
                  onClick={() => {
                    setMode("edit");
                  }}
                >
                  <PencilIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Edit</TooltipContent>
            </Tooltip>

            <CopyMessageButton message={message} />
          </div>
        </div>
      )}
      {mode === "edit" && (
        <div className="flex flex-row items-end gap-2">
          <div className="size-8" />

          <MessageEditor key={message.id} message={message} setMode={setMode} />
        </div>
      )}
    </>
  );
}
