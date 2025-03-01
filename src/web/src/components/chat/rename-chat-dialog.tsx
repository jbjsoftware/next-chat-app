import React, { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

export default function RenameChatDialog({
  showRenameDialog,
  setShowRenameDialog,
  currentTitle,
  handleRename,
}: {
  showRenameDialog: boolean;
  setShowRenameDialog: (open: boolean) => void;
  currentTitle: string;
  handleRename: (newTitle: string) => void;
}) {
  const [newTitle, setNewTitle] = useState(currentTitle);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Reset the input value when the dialog opens with a new currentTitle
  React.useEffect(() => {
    if (showRenameDialog) {
      setNewTitle(currentTitle);
      // Focus the input after a short delay to ensure the dialog is fully mounted
      setTimeout(() => {
        inputRef.current?.focus();
      });
    }
  }, [showRenameDialog, currentTitle]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      handleRename(newTitle);
    }
  };

  return (
    <AlertDialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Rename Chat</AlertDialogTitle>
          <AlertDialogDescription>
            Current title: <span className="font-medium">{currentTitle}</span>
            <br />
            Enter a new title for your chat.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={onSubmit}>
          <div className="py-4">
            <Input
              ref={inputRef}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Chat title"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <AlertDialogAction type="submit" onClick={(e) => e.preventDefault()}>
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
