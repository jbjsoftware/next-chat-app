import { ArrowUp, LoaderCircle, StopCircle } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";

export type UserPromptFormProps = {
  input: string;
  handleSubmit: (
    event: React.FormEvent<HTMLFormElement>,
    options?: any,
  ) => void;
  status: string;
  stop: () => void;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

const UserPromptForm = ({
  input,
  handleSubmit,
  status,
  stop,
  handleChange,
}: UserPromptFormProps) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  return (
    <form
      className="mx-auto flex w-full items-center"
      onSubmit={(event) => {
        handleSubmit(event);
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
                handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
              }
            }}
          />
        </CardContent>
        <CardFooter className="flex justify-between pb-3">
          <div className="flex space-x-2"></div>
          {status !== "streaming" && (
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
          )}
          {status === "streaming" && (
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => stop()}
              >
                <StopCircle />
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </form>
  );
};

export default UserPromptForm;
