"use client";
import { ArrowUp, LoaderCircle, RefreshCcw, Square } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { addMessageToChat, getChat } from "@/lib/db";
import { useChatContext } from "@/contexts/chat-context";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ChatRequestOptions } from "ai";
import { AutosizeTextarea, AutosizeTextAreaRef } from "../ui/autosize-textarea";

const SubmitButton = ({ status }: { status: string }) => {
  return (
    <div className="flex space-x-2">
      <Button
        className="h-10 w-10 cursor-pointer rounded-full"
        type="submit"
        variant="outline"
        disabled={status == "submitted"}
      >
        {status == "submitted" ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          <ArrowUp />
        )}
      </Button>
    </div>
  );
};

const StopButton = ({ stop }: { stop: () => void }) => {
  return (
    <div className="flex space-x-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={stop}
            className="h-10 w-10 cursor-pointer rounded-full"
            type="button"
            variant="default"
          >
            <Square className="bg-secondary text-secondary" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Stop</TooltipContent>
      </Tooltip>
    </div>
  );
};

export type UserPromptFormProps = {
  input: string;
  handleSubmit: (
    event: React.FormEvent<HTMLFormElement>,
    options?: any,
  ) => void;
  status: string;
  stop: () => void;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  chatId: string;
  error: Error | undefined;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
};

const UserPromptForm = ({
  input,
  handleSubmit,
  status,
  stop,
  handleChange,
  chatId,
  error,
  reload,
}: UserPromptFormProps) => {
  const textareaRef = React.useRef<AutosizeTextAreaRef>(null);

  const router = useRouter();

  const { saveNewChat } = useChatContext();

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    const chat = await getChat(chatId);

    if (!chat) {
      await saveNewChat(chatId, input);
      router.push(`/chat/${chatId}`);
    }

    await addMessageToChat(chatId, {
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
            onChange={handleChange}
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

          {status === "streaming" ? (
            <StopButton stop={stop} />
          ) : (
            <SubmitButton status={status} />
          )}
        </CardFooter>
      </Card>
    </form>
  );
};

export default UserPromptForm;
