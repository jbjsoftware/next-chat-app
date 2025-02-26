import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function generateTitle(content: string): Promise<string> {
  // Truncate and clean the content for title
  const maxLength = 50;
  const cleaned = content
    .trim()
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .slice(0, maxLength);

  return cleaned + (content.length > maxLength ? "..." : "");
}
