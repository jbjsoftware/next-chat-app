"use client";
import { ChevronsUpDown, Monitor, Moon, Sun, UserIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SignOut } from "./auth/signout-button";
import { Button } from "@/components/ui/button";

const UserMenuTrigger = () => {
  const { data: session } = useSession();

  return (
    <DropdownMenuTrigger asChild>
      <Button type="button" variant="ghost" className="h-12 w-full justify-between">
        <div className="flex w-full items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="h-full w-full bg-slate-700 text-white">
              <UserIcon style={{ height: 28, width: 28 }} />
            </AvatarFallback>
          </Avatar>

          <div className="flex-fill truncate text-ellipsis">
            <span className="text-xs font-medium">{session?.user?.email}</span>
          </div>
        </div>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
      </Button>
    </DropdownMenuTrigger>
  );
};

const ThemeRadioGroup = () => {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenuGroup>
      <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
        <div className="bpr flex items-center justify-between gap-2 p-2">
          <span className="text-sm">Theme</span>
          <div className="flex gap-1 rounded-md border border-zinc-200 p-0.5 dark:border-zinc-700">
            <Button
              type="button"
              variant={theme === "system" ? "secondary" : "ghost"}
              size="icon"
              className="h-6 w-6"
              onClick={() => setTheme("system")}
            >
              <Monitor className="h-4 w-4" />
              <span className="sr-only">System theme</span>
            </Button>
            <Button
              type="button"
              variant={theme === "light" ? "secondary" : "ghost"}
              size="icon"
              className="h-6 w-6"
              onClick={() => setTheme("light")}
            >
              <Sun className="h-4 w-4" />
              <span className="sr-only">Light theme</span>
            </Button>
            <Button
              type="button"
              variant={theme === "dark" ? "secondary" : "ghost"}
              size="icon"
              className="h-6 w-6"
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-4 w-4" />
              <span className="sr-only">Dark theme</span>
            </Button>
          </div>
        </div>
      </DropdownMenuRadioGroup>
    </DropdownMenuGroup>
  );
};

export function SidebarUserNav() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <UserMenuTrigger />

          <DropdownMenuContent className="w-64" align="start" alignOffset={-8} forceMount>
            <DropdownMenuItem asChild>
              <SignOut />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Preferences</DropdownMenuLabel>
            <ThemeRadioGroup />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
