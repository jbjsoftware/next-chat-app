"use client";
import { ArrowUp, LoaderCircle, Square } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { addMessageToChat, getChat } from "@/lib/db";
import { useChatContext } from "@/contexts/chat-context";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

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
};

const UserPromptForm = ({
  input,
  handleSubmit,
  status,
  stop,
  handleChange,
  chatId,
}: UserPromptFormProps) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

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
        textareaRef.current?.focus();
      }}
    >
      <Card className="flex-fill flex w-full hover:border-card-foreground">
        <CardContent className="mt-3 flex flex-col pb-0">
          <textarea
            ref={textareaRef}
            className="max-h-[150px] w-full resize-none overflow-y-auto bg-transparent outline-none"
            placeholder="Type a message..."
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
