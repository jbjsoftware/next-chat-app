import React from "react";
import { X } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";

export interface Attachment {
  id: string;
  type: "image" | "text" | "other";
  name: string;
  url: string;
  content?: string;
}

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
}

export function AttachmentPreview({ attachments, onRemove }: AttachmentPreviewProps) {
  if (!attachments.length) return null;

  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {attachments.map((attachment) => (
        <div key={attachment.id} className="relative">
          {attachment.type === "image" ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-md border">
              <Image src={attachment.url} alt={attachment.name} fill className="object-cover" sizes="96px" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-0 right-0 h-6 w-6 rounded-full p-1"
                onClick={() => onRemove(attachment.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex max-w-xs items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
              <span className="truncate text-sm">{attachment.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full p-1"
                onClick={() => onRemove(attachment.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
