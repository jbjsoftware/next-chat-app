"use client";

import { memo, useState } from "react";
import { isToday, isYesterday, subMonths, subWeeks } from "date-fns";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MoreHorizontal, Trash, Pencil } from "lucide-react";
import { toast } from "sonner";

import { useChatHistoryContext } from "@/contexts/chat-history-context";
import { Chat } from "@/lib/db";
import DeleteChatHistoryDialog from "./delete-chat-history-dialog";
import RenameChatDialog from "./rename-chat-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type GroupedChats = {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
};

const PureChatItem = ({
  chat,
  isActive,
  onDelete,
  onRename,
  setOpenMobile,
}: {
  chat: Chat;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  onRename: (chatId: string, currentTitle: string) => void;
  setOpenMobile: (open: boolean) => void;
}) => {
  return (
    <SidebarMenuItem data-chat-id={chat.id}>
      <SidebarMenuButton asChild isActive={isActive} className="w-full">
        <Link href={`/chat/${chat.id}`} onClick={() => setOpenMobile(false)}>
          <span className="chat-title block w-full overflow-hidden">{chat.title}</span>
        </Link>
      </SidebarMenuButton>

      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction
            className="mr-0.5 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            showOnHover={!isActive}
          >
            <MoreHorizontal />
            <span className="sr-only">More</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem className="cursor-pointer" onSelect={() => onRename(chat.id, chat.title)}>
            <Pencil className="mr-2 h-4 w-4" />
            <span>Rename</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
            onSelect={() => onDelete(chat.id)}
          >
            <Trash className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) return false;
  if (prevProps.chat.title !== nextProps.chat.title) return false;
  return true;
});

export function ChatHistory() {
  const { chats, deleteChatById, updateChatById, updateChatTitleOptimistic } = useChatHistoryContext();

  const { setOpenMobile } = useSidebar();
  const { id } = useParams();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState<string>("");
  const [showRenameDialog, setShowRenameDialog] = useState(false);

  const router = useRouter();

  const handleDelete = async () => {
    const deletePromise = deleteChatById(deleteId!);

    toast.promise(deletePromise, {
      loading: "Deleting chat...",
      success: () => {
        return "Chat deleted successfully";
      },
      error: "Failed to delete chat",
    });

    setShowDeleteDialog(false);

    if (deleteId === id) {
      router.push("/");
    }
  };

  const handleRename = async (newTitle: string) => {
    if (renameId) {
      // Update the UI immediately
      updateChatTitleOptimistic(renameId, newTitle);

      // Then update the database
      const renamePromise = updateChatById(renameId, { title: newTitle });

      toast.promise(renamePromise, {
        loading: "Renaming chat...",
        success: () => "Chat renamed successfully",
        error: () => "Failed to rename chat",
      });

      setShowRenameDialog(false);
    }
  };

  if (chats?.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-wrap text-zinc-500">
            Your conversations will appear here once you start chatting!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  const groupChatsByDate = (chats: Chat[]): GroupedChats => {
    const now = new Date();
    const oneWeekAgo = subWeeks(now, 1);
    const oneMonthAgo = subMonths(now, 1);

    return chats.reduce(
      (groups, chat) => {
        const chatDate = new Date(chat.createdAt);

        if (isToday(chatDate)) {
          groups.today.push(chat);
        } else if (isYesterday(chatDate)) {
          groups.yesterday.push(chat);
        } else if (chatDate > oneWeekAgo) {
          groups.lastWeek.push(chat);
        } else if (chatDate > oneMonthAgo) {
          groups.lastMonth.push(chat);
        } else {
          groups.older.push(chat);
        }

        return groups;
      },
      {
        today: [],
        yesterday: [],
        lastWeek: [],
        lastMonth: [],
        older: [],
      } as GroupedChats,
    );
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {chats &&
              (() => {
                const groupedChats = groupChatsByDate(chats);

                return (
                  <>
                    {groupedChats.today.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">Today</div>
                        {groupedChats.today.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === id}
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setShowDeleteDialog(true);
                            }}
                            onRename={(chatId, currentTitle) => {
                              setRenameId(chatId);
                              setRenameTitle(currentTitle);
                              setShowRenameDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </>
                    )}

                    {groupedChats.yesterday.length > 0 && (
                      <>
                        <div className="mt-6 px-2 py-1 text-xs text-sidebar-foreground/50">Yesterday</div>
                        {groupedChats.yesterday.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === id}
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setShowDeleteDialog(true);
                            }}
                            onRename={(chatId, currentTitle) => {
                              setRenameId(chatId);
                              setRenameTitle(currentTitle);
                              setShowRenameDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </>
                    )}

                    {groupedChats.lastWeek.length > 0 && (
                      <>
                        <div className="mt-6 px-2 py-1 text-xs text-sidebar-foreground/50">Last 7 days</div>
                        {groupedChats.lastWeek.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === id}
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setShowDeleteDialog(true);
                            }}
                            onRename={(chatId, currentTitle) => {
                              setRenameId(chatId);
                              setRenameTitle(currentTitle);
                              setShowRenameDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </>
                    )}

                    {groupedChats.lastMonth.length > 0 && (
                      <>
                        <div className="mt-6 px-2 py-1 text-xs text-sidebar-foreground/50">Last 30 days</div>
                        {groupedChats.lastMonth.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === id}
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setShowDeleteDialog(true);
                            }}
                            onRename={(chatId, currentTitle) => {
                              setRenameId(chatId);
                              setRenameTitle(currentTitle);
                              setShowRenameDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </>
                    )}

                    {groupedChats.older.length > 0 && (
                      <>
                        <div className="mt-6 px-2 py-1 text-xs text-sidebar-foreground/50">Older</div>
                        {groupedChats.older.map((chat) => (
                          <ChatItem
                            key={chat.id}
                            chat={chat}
                            isActive={chat.id === id}
                            onDelete={(chatId) => {
                              setDeleteId(chatId);
                              setShowDeleteDialog(true);
                            }}
                            onRename={(chatId, currentTitle) => {
                              setRenameId(chatId);
                              setRenameTitle(currentTitle);
                              setShowRenameDialog(true);
                            }}
                            setOpenMobile={setOpenMobile}
                          />
                        ))}
                      </>
                    )}
                  </>
                );
              })()}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <DeleteChatHistoryDialog
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        handleDelete={handleDelete}
      />

      <RenameChatDialog
        showRenameDialog={showRenameDialog}
        setShowRenameDialog={setShowRenameDialog}
        currentTitle={renameTitle}
        handleRename={handleRename}
      />
    </>
  );
}
