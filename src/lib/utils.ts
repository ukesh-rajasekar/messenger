import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "util";

export function cn(...input: ClassValue[]) {
  return twMerge(clsx(input));
}

export function chatLinkConstructor(id1: string, id2: string) {
  const sortedIds = [id1, id2].sort();
  return sortedIds.join("--");
}

export const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);

  // Define the formatting options
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeStyle: "short",
  });

  // Format the date and time
  return formatter.format(date);
};

export const toKeyPusher = (key: string) => {
  return key.replace(/:/g, "__");
};
