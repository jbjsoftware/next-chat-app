"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Message } from "ai";

import { Button } from "@/components/ui/button";
import { useChatContext } from "@/contexts/chat-context";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";

export type MessageEditorProps = {
  message: Message;
  setMode: Dispatch<SetStateAction<"view" | "edit">>;
};

export function MessageEditor({ message, setMode }: MessageEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [draftContent, setDraftContent] = useState<string>(message.content);

  const { updateMessage, reload } = useChatContext();

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraftContent(event.target.value);
  };
  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    await updateMessage(message.id, draftContent);

    setMode("view");
    reload();
    setIsSubmitting(false);
  };

  return (
    <form className="flex w-full min-w-full md:min-w-80" onSubmit={submitForm}>
      <Card className="w-full gap-1 pt-3">
        <CardContent className="mb-0 px-1 pb-0">
          <AutosizeTextarea
            className="w-full resize-none overflow-y-auto border-0 bg-transparent ring-offset-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Type a message..."
            maxHeight={200}
            value={draftContent}
            onChange={handleInput}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submitForm(e as unknown as React.FormEvent<HTMLFormElement>);
              }
            }}
          />
        </CardContent>
        <CardFooter className="flex flex-row justify-end gap-2 px-2 pb-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setMode("view");
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            size="sm"
            disabled={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);

              await updateMessage(message.id, draftContent);

              setMode("view");
              reload();
            }}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
