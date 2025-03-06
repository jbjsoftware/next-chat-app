import React from "react";
import Image from "next/image";
import { PaperclipIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Attachment } from "./attachment-preview";

interface AttachmentCardsProps {
  attachments: Attachment[];
  isUserMessage: boolean;
}

export function AttachmentCards({ attachments, isUserMessage }: AttachmentCardsProps) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", isUserMessage ? "justify-end" : "justify-start")}>
      {attachments.map((attachment) => (
        <div key={attachment.id} className="flex items-center">
          {attachment.type === "image" ? (
            <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="block">
              <div className="relative h-24 w-24 overflow-hidden rounded-md border bg-muted transition-opacity hover:opacity-90">
                <Image src={attachment.url} alt={attachment.name} fill className="object-cover" sizes="96px" />
                <div className="absolute right-0 bottom-0 left-0 truncate bg-background/80 p-1 text-xs">
                  {attachment.name}
                </div>
              </div>
            </a>
          ) : (
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 transition-colors hover:bg-muted"
            >
              <PaperclipIcon className="h-4 w-4" />
              <span className="max-w-[150px] truncate">{attachment.name}</span>
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
