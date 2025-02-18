"use client";

import { ChangeEvent, useRef, useState, useEffect } from "react";

import ReactMarkdown from "react-markdown";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Mic, Paperclip, SendHorizonal, Copy, ArrowDown } from "lucide-react";

import { useChat } from "@ai-sdk/react";

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
    const messageContainer = messageContainerRef.current;
    if (messageContainer) {
      messageContainer.addEventListener("scroll", handleScroll);
      handleScroll(); // Initial check
    }
    return () => {
      if (messageContainer) {
        messageContainer.removeEventListener("scroll", handleScroll);
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
    <div className="w-full h-screen flex flex-col py-4 px-4">
      {/* Message Container */}
      <div
        className="flex flex-col flex-grow min-h-64 overflow-auto pt-4"
        ref={messageContainerRef}
      >
        <div className="flex flex-col flex-grow w-full max-w-screen-lg mx-auto">
          <div className="flex flex-col flex-grow gap-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col gap-2 ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div className="text-sm text-gray-700">
                  {message.role === "user" ? "You" : "AI"}
                </div>
                <div
                  className={`p-2 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary-500 text-gray-500"
                      : "bg-card-foreground text-card"
                  }`}
                >
                  {message.role === "user" ? (
                    message.content
                  ) : (
                    <div className="flex items-start">
                      <ReactMarkdown className="flex-grow">
                        {message.content}
                      </ReactMarkdown>
                      <CopyToClipboard text={message.content}>
                        <Button variant="ghost" size="icon">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </CopyToClipboard>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* End Message Container */}
      {/* Scroll to Bottom Button */}
      <div className="flex justify-center mb-2" style={{ height: "40px" }}>
        {canScrollDown && (
          <Button variant="ghost" size="icon" onClick={scrollToBottom}>
            <ArrowDown className="w-6 h-6" />
          </Button>
        )}
      </div>
      {/* Input Container */}
      <div className="w-full">
        <Card className="max-w-screen-lg mx-auto flex flex-col">
          <CardContent className="flex flex-col pb-0 mt-3">
            <textarea
              ref={textareaRef}
              className="w-full resize-none outline-none max-h-[150px] overflow-y-auto"
              placeholder="Type a message..."
              value={input}
              onChange={handleChange}
              rows={1}
              disabled={status !== "ready"}
            />
          </CardContent>
          <CardFooter className="pb-3">
            <form
              className="flex justify-between items-center w-full"
              onSubmit={handleSubmit}
            >
              <div className="flex space-x-2">
                <Button type="button" variant="ghost" size="icon">
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
      {/* End Input Container */}
    </div>
  );
}
