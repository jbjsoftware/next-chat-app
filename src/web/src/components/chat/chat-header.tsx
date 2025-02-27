"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { useWindowSize } from "usehooks-ts";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { ModelSelector } from "./model-selector";
import { SidebarToggle } from "../sidebar-toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function PureChatHeader({ selectedModelId }: { selectedModelId: string }) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();

  return (
    <header className="flex items-center gap-2 bg-background px-2 py-1.5 md:px-2">
      <SidebarToggle />

      <ModelSelector selectedModelId={selectedModelId} className="order-1 md:order-2" />

      {(!open || windowWidth < 768) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2 ml-auto px-2 md:order-1 md:ml-0 md:h-fit md:px-2"
              onClick={() => {
                router.push("/");
                router.refresh();
              }}
            >
              <PlusIcon />
              <span className="md:sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
