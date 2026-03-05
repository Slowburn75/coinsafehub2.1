import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function constructErrorMessage(errorObj: any): string {
  if (typeof errorObj === "string") return errorObj;

  let errorMessage = "";
  if (errorObj && typeof errorObj === "object") {
    for (const [field, messages] of Object.entries(errorObj)) {
      if (Array.isArray(messages)) {
        messages.forEach((message) => {
          errorMessage += `Error in ${field}: ${message}\n`;
        });
      } else {
        errorMessage += `Error in ${field}: ${messages}\n`;
      }
    }
  }

  return errorMessage.trim() || "An unexpected error occurred.";
}

