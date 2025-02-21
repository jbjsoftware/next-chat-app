"use client";

import { ChangeEvent, useRef, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Mic, Paperclip, SendHorizonal, ArrowDown, X } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import Markdown from "react-markdown";
import MarkdownRenderer from "./MarkdownRenderer";

interface FileChipProps {
  file: File;
  onRemove: () => void;
}

const FileChip: React.FC<FileChipProps> = ({ file, onRemove }) => {
  return (
    <div className="flex items-center space-x-2 bg-gray-200 rounded-full px-3 py-1">
      <span className="text-sm text-gray-700">{file.name}</span>
      <button onClick={onRemove} className="text-gray-500 hover:text-gray-700">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(
    () => {
      console.log("Copied to clipboard successfully!");
    },
    (err) => {
      console.error("Could not copy text: ", err);
    }
  );
}

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: "http://localhost:3001/chat",
    onFinish: (message, { usage, finishReason }) => {
      console.log("Finished streaming message:", message);
      console.log("Token usage:", usage);
      console.log("Finish reason:", finishReason);
    },
    onError: (error) => {
      console.log("An error occurred:", error);
    },
    onResponse: (response) => {
      console.log("Received HTTP response from server:", response);
    },
  });

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      setFiles(event.target.files);
      //   const fileList = Array.from(event.target.files);

      //   const processedFiles = await Promise.all(
      //     fileList.map(async (file) => {
      //       if (file.type.startsWith("image/") || file.type.startsWith("text/")) {
      //         return file;
      //       } else {
      //         const base64Content = await convertToBase64(file);
      //         return new File([base64Content], file.name, { type: file.type });
      //       }
      //     })
      //   );

      //   const dataTransfer = new DataTransfer();
      //   processedFiles.forEach((file) => dataTransfer.items.add(file));
      //   setFiles(dataTransfer.files);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const removeFile = (index: number) => {
    if (files) {
      const fileArray = Array.from(files);
      fileArray.splice(index, 1);
      const dataTransfer = new DataTransfer();
      fileArray.forEach((file) => dataTransfer.items.add(file));
      setFiles(dataTransfer.files);
    }
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );

  const handleChange = (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
    handleInputChange(e);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  };

  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messageContainerRef.current;
      setCanScrollDown(scrollTop + clientHeight < scrollHeight);
    }
  };

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
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
    <div className="w-full flex-fill flex flex-col py-4 px-4">
      <div
        className="flex flex-col flex-fill min-h-64 overflow-auto pt-4"
        ref={messageContainerRef}
      >
        <div className="flex flex-col flex-fill w-full max-w-screen-lg mx-auto">
          <div className="flex flex-col flex-fill gap-8">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col gap-2 ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {message.role === "user" ? (
                  <Card className="px-4 py-2 rounded-3xl">
                    {message.content}
                  </Card>
                ) : (
                  <div className="flex">
                    <MarkdownRenderer content={message.content} />
                    {/* <ReactMarkdown className="flex-grow">
                      {message.content}
                    </ReactMarkdown> */}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-center mb-2" style={{ height: "40px" }}>
        {canScrollDown && (
          <Button variant="ghost" size="icon" onClick={scrollToBottom}>
            <ArrowDown className="w-6 h-6" />
          </Button>
        )}
      </div>
      <div className="w-full">
        <Card className="max-w-screen-lg mx-auto flex flex-col">
          <CardContent className="flex flex-col pb-0 mt-3">
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
              className="w-full resize-none outline-none max-h-[150px] overflow-y-auto bg-transparent"
              placeholder="Type a message..."
              value={input}
              onChange={handleChange}
              rows={1}
              disabled={status !== "ready"}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(
                    e as unknown as React.FormEvent<HTMLFormElement>
                  );
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
              className="flex justify-between items-center w-full"
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
                  {status == "submitted" ? "Loading..." : <SendHorizonal />}
                </Button>
              </div>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
