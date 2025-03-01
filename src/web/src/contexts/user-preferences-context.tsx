"use client";

import { useTheme } from "next-themes";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type UserPreferencesContextProps = {
  theme?: string;
  setTheme: (theme: string) => void;
  autoScroll: boolean;
  setAutoScroll: (autoScroll: boolean) => void;
};

const UserPreferencesContext = createContext<UserPreferencesContextProps | undefined>(undefined);

export const UserPreferencesProvider = ({ children }: { children: ReactNode }) => {
  const { theme, setTheme } = useTheme();
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    const storedAutoScroll = localStorage.getItem("autoScroll");

    if (storedAutoScroll) {
      setAutoScroll(storedAutoScroll === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("autoScroll", autoScroll.toString());
  }, [autoScroll]);

  return (
    <UserPreferencesContext.Provider
      value={{
        theme,
        setTheme,
        autoScroll,
        setAutoScroll,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferencesContext = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error("useUserPreferencesContext must be used within a UserPreferencesProvider");
  }
  return context;
};
