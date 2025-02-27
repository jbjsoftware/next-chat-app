"use client";

import React, { ChangeEvent } from "react";
import { ArrowUp, LoaderCircle, RefreshCcw, Square } from "lucide-react";
import { useRouter } from "next/navigation";

import { addMessageToChat, getChat } from "@/lib/db";
import { useChatContext } from "@/contexts/chat-context";
import { useChatHistoryContext } from "@/contexts/chat-history-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AutosizeTextarea, AutosizeTextAreaRef } from "@/components/ui/autosize-textarea";

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
  const { input, handleInputChange, stop, status, reload, handleSubmit, error, id } = useChatContext();

  const router = useRouter();

  const { saveNewChat } = useChatHistoryContext();

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    const chat = await getChat(id);

    if (!chat) {
      await saveNewChat(id, input);
      router.push(`/chat/${id}`);
    }

    await addMessageToChat(id, {
      content: input,
      role: "user",
    });

    handleSubmit(event);
  };

  return (
    <form
      className="mx-auto flex w-full items-center"
      onSubmit={(event) => {
        submitForm(event);
      }}
      onClick={() => {
        textareaRef.current?.textArea?.focus();
      }}
    >
      <Card className="flex-fill flex w-full cursor-text gap-2 hover:border-card-foreground">
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
          <div className="flex space-x-2"></div>

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
    </form>
  );
};

export default UserPromptForm;
