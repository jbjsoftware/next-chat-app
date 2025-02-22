"use client";

import { ChangeEvent, useRef, useState, useEffect } from "react";
import {
  Mic,
  Paperclip,
  SendHorizonal,
  ArrowDown,
  X,
  RefreshCcw,
  StopCircle,
  LoaderCircle,
} from "lucide-react";
import { useChat } from "@ai-sdk/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import MarkdownRenderer from "./MarkdownRenderer";
import { toast } from "sonner";

interface FileChipProps {
  file: File;
  onRemove: () => void;
}

const FileChip: React.FC<FileChipProps> = ({ file, onRemove }) => {
  return (
    <div className="flex items-center space-x-2 rounded-full bg-gray-200 px-3 py-1">
      <span className="text-sm text-gray-700">{file.name}</span>
      <button onClick={onRemove} className="text-gray-500 hover:text-gray-700">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default function Chat() {
  const { messages, status, reload, error } = useChat({
    id: "chat",
    api: process.env.NEXT_PUBLIC_CHAT_API_URL,
    onError: (apiError) => {
      console.log("An error occurred:", apiError);
      toast.error(`An error occured: ${apiError.message}`);
    },
  });

  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const [isScrolling, setIsScrolling] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messageContainerRef.current;
      setCanScrollDown(scrollTop + clientHeight < scrollHeight);
    }
  };

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      setIsScrolling(true);
      // let scrollInterval: ReturnType<typeof setInterval>;

      const performScroll = () => {
        messageContainerRef.current?.scrollTo({
          top: messageContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      };

      // Initial scroll
      performScroll();

      // Set up interval with getCurrentStatus check
      const scrollInterval = setInterval(() => {
        // Get current status value from ref
        if (statusRef.current === "streaming") {
          performScroll();
        } else {
          performScroll();
          // Clean up interval if we're no longer streaming
          clearInterval(scrollInterval);
          setIsScrolling(false);
        }
      }, 500);

      // Clean up interval on unmount
      return () => {
        if (scrollInterval) {
          clearInterval(scrollInterval);
          setIsScrolling(false);
        }
      };
    }
  };

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.addEventListener("scroll", handleScroll);
      handleScroll(); // Initial check
    }
    return () => {
      if (messageContainerRef.current) {
        messageContainerRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, [messages]);

  return (
    <div className="flex-fill flex w-full flex-col px-4 py-4">
      <h1>Current Status: {status}</h1>
      <div
        className="flex-fill flex min-h-64 flex-col overflow-auto pt-4"
        ref={messageContainerRef}
      >
        <div className="flex-fill mx-auto flex w-full max-w-screen-lg flex-col">
          <div className="flex-fill flex flex-col gap-8">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col gap-2 ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {message.role === "user" ? (
                  <Card className="rounded-3xl px-4 py-2">
                    {message.content}
                  </Card>
                ) : (
                  <div className="flex">
                    <MarkdownRenderer content={message.content} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {error && (
        <div className="flex justify-end">
          <Card className="my-2 bg-red-600">
            <CardContent className="flex items-center justify-end gap-3 py-2">
              <div> An error occurred</div>
              <Button type="button" onClick={() => reload()}>
                Retry <RefreshCcw />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      <div className="mb-2 flex justify-center" style={{ height: "40px" }}>
        {canScrollDown && !isScrolling && (
          <Button variant="ghost" size="icon" onClick={scrollToBottom}>
            <ArrowDown className="h-6 w-6" />
          </Button>
        )}
      </div>
      <MessageContainer />
    </div>
  );
}

const MessageContainer = () => {
  const { input, handleInputChange, handleSubmit, stop, status } = useChat({
    id: "chat",
    api: process.env.NEXT_PUBLIC_CHAT_API_URL,
    onError: (apiError) => {
      console.log("An error occurred:", apiError);
      toast.error(`An error occured: ${apiError.message}`);
    },
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null,
  );
  const handleChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>,
  ) => {
    handleInputChange(e);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150,
      )}px`;
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files) {
      setFiles(event.target.files);
    }
  };

  // const convertToBase64 = (file: File): Promise<string> => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = () => resolve(reader.result as string);
  //     reader.onerror = (error) => reject(error);
  //   });
  // };

  const removeFile = (index: number) => {
    if (files) {
      const fileArray = Array.from(files);
      fileArray.splice(index, 1);
      const dataTransfer = new DataTransfer();
      fileArray.forEach((file) => dataTransfer.items.add(file));
      setFiles(dataTransfer.files);
    }
  };

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const speechRecognition = new window.webkitSpeechRecognition();
      speechRecognition.continuous = false;
      speechRecognition.interimResults = false;
      speechRecognition.lang = "en-US";

      speechRecognition.onstart = () => {
        setIsRecording(true);
      };

      speechRecognition.onend = () => {
        setIsRecording(false);
      };

      speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        handleInputChange({
          target: { value: transcript },
        } as ChangeEvent<HTMLTextAreaElement>);
      };

      setRecognition(speechRecognition);
    }
  }, []);

  const handleMicClick = () => {
    if (recognition) {
      if (isRecording) {
        recognition.stop();
      } else {
        recognition.start();
      }
    }
  };

  return (
    <div className="w-full">
      <Card className="mx-auto flex max-w-screen-lg flex-col">
        <CardContent className="mt-3 flex flex-col pb-0">
          {files && (
            <div className="mb-4 flex flex-wrap gap-2">
              {Array.from(files).map((file, index) => (
                <FileChip
                  key={index}
                  file={file}
                  onRemove={() => removeFile(index)}
                />
              ))}
            </div>
          )}
          <textarea
            ref={textareaRef}
            className="max-h-[150px] w-full resize-none overflow-y-auto bg-transparent outline-none"
            placeholder="Type a message..."
            value={input}
            onChange={handleChange}
            rows={1}
            disabled={status !== "ready"}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
              }
            }}
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            multiple
          />
        </CardContent>
        <CardFooter className="pb-3">
          <form
            className="flex w-full items-center justify-between"
            onSubmit={(event) => {
              handleSubmit(event, {
                experimental_attachments: files,
              });

              setFiles(undefined);

              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
          >
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip />
              </Button>
            </div>
            {status !== "streaming" && (
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleMicClick}
                >
                  <Mic className={isRecording ? "text-red-500" : ""} />
                </Button>
                <Button
                  type="submit"
                  size="icon"
                  variant="outline"
                  disabled={status == "submitted"}
                >
                  {status == "submitted" ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <SendHorizonal />
                  )}
                </Button>
              </div>
            )}
            {status === "streaming" && (
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={() => stop()}>
                  <StopCircle />
                </Button>
              </div>
            )}
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};
