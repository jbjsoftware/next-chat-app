"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";

export default function ScrollToBottomButton({
  status,
  messages,
  scrollContainerRef,
}: {
  status: string;
  messages: any[];
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [isScrolling, setIsScrolling] = useState(false);

  const [canScrollDown, setCanScrollDown] = useState(false);

  const statusRef = React.useRef(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      setIsScrolling(true);
      // let scrollInterval: ReturnType<typeof setInterval>;

      const performScroll = () => {
        scrollContainerRef.current?.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      };

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
      }, 300);

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
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          scrollContainerRef.current;
        setCanScrollDown(scrollTop + clientHeight < scrollHeight);
      }
    };
    const messageContainer = scrollContainerRef.current;

    if (messageContainer) {
      messageContainer.addEventListener("scroll", handleScroll);
      handleScroll(); // Initial check
    }
    return () => {
      if (messageContainer) {
        messageContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [messages, scrollContainerRef]);

  return (
    <>
      {canScrollDown && !isScrolling && (
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full"
          onClick={scrollToBottom}
        >
          <ChevronDown className="h-6 w-6" />
        </Button>
      )}
    </>
  );
}
