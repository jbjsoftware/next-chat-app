"use client";

import React, { ChangeEvent, useRef, useState } from "react";
import { ArrowUp, LoaderCircle, PaperclipIcon, RefreshCcw, Square } from "lucide-react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";

import { addMessageToChat, getChat } from "@/lib/db";
import { useChatContext } from "@/contexts/chat-context";
import { useChatHistoryContext } from "@/contexts/chat-history-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AutosizeTextarea, AutosizeTextAreaRef } from "@/components/ui/autosize-textarea";
import { AttachmentPreview, Attachment } from "./attachments";

const SubmitButton = ({ status }: { status: string }) => {
  return (
    <div className="flex space-x-2">
      <Button
        className="h-10 w-10 cursor-pointer rounded-full"
        type="submit"
        variant="outline"
        disabled={status == "submitted"}
      >
        {status == "submitted" ? <LoaderCircle className="animate-spin" /> : <ArrowUp />}
      </Button>
    </div>
  );
};

const StopButton = ({ stop }: { stop: () => void }) => {
  return (
    <div className="flex space-x-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={stop} className="h-10 w-10 cursor-pointer rounded-full" type="button" variant="default">
            <Square className="bg-secondary text-secondary" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Stop</TooltipContent>
      </Tooltip>
    </div>
  );
};

const UserPromptForm = () => {
  const textareaRef = React.useRef<AutosizeTextAreaRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { input, handleInputChange, stop, status, reload, handleSubmit, error, id, setAttachments } = useChatContext();
  const [localAttachments, setLocalAttachments] = useState<Attachment[]>([]);

  const router = useRouter();

  const { saveNewChat } = useChatHistoryContext();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = [];

    Array.from(files).forEach((file) => {
      const fileId = nanoid();
      const url = URL.createObjectURL(file);
      const fileType = file.type.startsWith("image/") ? "image" : file.type.startsWith("text/") ? "text" : "other";

      newAttachments.push({
        id: fileId,
        name: file.name,
        type: fileType,
        url: url,
      });

      // For text files, read the content
      if (fileType === "text") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setLocalAttachments((prev) => prev.map((att) => (att.id === fileId ? { ...att, content } : att)));
        };
        reader.readAsText(file);
      }
    });

    setLocalAttachments((prev) => [...prev, ...newAttachments]);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setLocalAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    const chat = await getChat(id);

    if (!chat) {
      await saveNewChat(id, input);
      router.push(`/chat/${id}`);
    }

    // Update the attachments in the chat context
    setAttachments(localAttachments);

    await addMessageToChat(id, {
      content: input,
      role: "user",
      attachments: localAttachments,
    });

    // Reset attachments after sending
    setLocalAttachments([]);

    handleSubmit(event);
  };

  return (
    <form
      className="mx-auto flex w-full flex-col items-center"
      onSubmit={(event) => {
        submitForm(event);
      }}
      onClick={() => {
        textareaRef.current?.textArea?.focus();
      }}
    >
      <Card className="flex-fill flex w-full cursor-text flex-col gap-2 hover:border-card-foreground">
        {localAttachments.length > 0 && (
          <div className="px-3 pt-3">
            <AttachmentPreview attachments={localAttachments} onRemove={removeAttachment} />
          </div>
        )}
        <CardContent className="mt-3 flex flex-col pb-0">
          <AutosizeTextarea
            ref={textareaRef}
            className="w-full resize-none overflow-y-auto border-0 bg-transparent ring-offset-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Type a message..."
            maxHeight={200}
            minHeight={20}
            value={input}
            onChange={handleInputChange as unknown as (e: ChangeEvent<HTMLTextAreaElement>) => void}
            rows={1}
            disabled={status !== "ready" && status !== "error"}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submitForm(e as unknown as React.FormEvent<HTMLFormElement>);
              }
            }}
          />
        </CardContent>
        <CardFooter className="flex justify-between pb-3">
          <div className="flex space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <PaperclipIcon className="h-5 w-5" />
                  <span className="sr-only">Attach file</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach file</TooltipContent>
            </Tooltip>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              onChange={handleFileChange}
              accept="image/*,text/*"
            />
          </div>

          {error && (
            <div className="flex justify-end">
              <Card className="bg-red-600 text-white">
                <CardContent className="flex items-center justify-end gap-3 py-1">
                  <div> An error occurred</div>
                  <Button type="button" onClick={() => reload()} size="sm">
                    Retry <RefreshCcw />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {status === "streaming" ? <StopButton stop={stop} /> : <SubmitButton status={status} />}
        </CardFooter>
      </Card>

      <div className="w-full px-3">
        <p className="pt-1 text-center text-xs font-extralight text-muted-foreground">
          ChatBot isn&apos;t perfect. Please verify generated responses.
        </p>
      </div>
    </form>
  );
};

export default UserPromptForm;
