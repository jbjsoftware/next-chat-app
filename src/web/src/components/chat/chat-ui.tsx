"use client";

import type React from "react";
import { useRef, useState } from "react";
import {
  Bot,
  ChevronDown,
  FileText,
  ImageIcon,
  MoreVertical,
  Paperclip,
  Send,
  Sparkles,
  Trash2,
  User2,
  X,
} from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { ChatProvider, useChatContext } from "@/contexts/chat-context";
import { addMessageToChat } from "@/lib/db";
import { format } from "date-fns";

function ChatUI() {
  const {
    chats,
    currentChat,
    setCurrentChat,
    createNewChat,
    deleteCurrentChat,
    saveNewChat,
  } = useChatContext();

  const [files, setFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      id: currentChat?.id, // Add chat ID for proper state management
      initialMessages: currentChat?.messages || [], // Initialize with current chat messages
      api: process.env.NEXT_PUBLIC_CHAT_API_URL,
      onFinish: async (message) => {
        if (currentChat?.id) {
          await addMessageToChat(currentChat.id, message);
        }
      },
    });

  // Remove the manual message setting effect since useChat will handle it:

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const removeFiles = () => {
    setFiles(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input && (!files || files.length === 0)) return;

    // Prepare attachments if any
    const experimental_attachments = files
      ? Array.from(files).map((file) => ({
          name: file.name,
          contentType: file.type,
          url: URL.createObjectURL(file),
        }))
      : undefined;

    // If this is a new chat, save it first
    if (!currentChat?.id) {
      const newChat = await saveNewChat(input);
      // Add the first message to the new chat
      await addMessageToChat(newChat.id, {
        role: "user",
        content: input,
        experimental_attachments,
      });
    } else {
      // Add message to existing chat
      await addMessageToChat(currentChat.id, {
        role: "user",
        content: input,
        experimental_attachments,
      });
    }

    // Use handleSubmit from useChat
    handleSubmit(e, {
      experimental_attachments,
    });

    removeFiles();
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader className="border-b">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={createNewChat}
            >
              <Sparkles className="h-4 w-4" />
              New Chat
            </Button>
          </SidebarHeader>
          <SidebarContent>
            <ScrollArea className="flex-1">
              <SidebarMenu>
                {chats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton
                      onClick={() => setCurrentChat(chat)}
                      isActive={currentChat?.id === chat.id}
                      className="justify-between"
                    >
                      <span className="truncate">
                        {chat.title || "New Chat"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(chat.createdAt, "MMM d")}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
            <div className="p-4 text-center text-xs text-muted-foreground">
              Built with Next.js, Azure OpenAI, and shadcn/ui
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="flex w-full flex-col">
          {/* Header */}
          <header className="flex h-14 items-center gap-4 border-b px-4 lg:h-16 lg:px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    GPT-4 Vision{" "}
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>
                    <Sparkles className="mr-2 h-4 w-4" />
                    GPT-4 Vision
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bot className="mr-2 h-4 w-4" />
                    GPT-3.5
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {currentChat?.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={deleteCurrentChat}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User2 className="h-5 w-5" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {/* Chat Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-6 flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-5 w-5" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.experimental_attachments?.map(
                    (attachment, index) => (
                      <div
                        key={index}
                        className="max-w-xs overflow-hidden rounded-lg"
                      >
                        {attachment.contentType?.startsWith("image/") ? (
                          <Image
                            src={attachment.url || "/placeholder.svg"}
                            alt={`Attachment ${index + 1}`}
                            width={300}
                            height={200}
                            className="object-cover"
                          />
                        ) : attachment.contentType === "application/pdf" ? (
                          <div className="flex items-center gap-2 bg-muted p-2">
                            <FileText className="h-4 w-4" />
                            <span className="truncate text-sm">
                              {attachment.name}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    ),
                  )}
                </div>
                {message.role === "user" && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="rounded-lg bg-muted px-4 py-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Chat Input */}
          <footer className="border-t p-4">
            <form
              onSubmit={onSubmit}
              className="mx-auto flex max-w-4xl flex-col gap-4"
            >
              {files && files.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Array.from(files).map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-lg bg-muted p-2 pr-3"
                    >
                      {file.type.startsWith("image/") ? (
                        <ImageIcon className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      <span className="max-w-[200px] truncate text-sm">
                        {file.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-2 h-4 w-4"
                        onClick={removeFiles}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove file</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,application/pdf"
                  multiple
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                  <span className="sr-only">Attach files</span>
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </form>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default function Page() {
  return (
    <ChatProvider>
      <ChatUI />
    </ChatProvider>
  );
}
