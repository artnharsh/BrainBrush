import { useCallback } from "react";
import { reportError, toAppError } from "../utils/errorHandler";

export const useErrorHandler = () => {
  const handleError = useCallback(
    (error: unknown, source: "api" | "socket" | "ui" | "runtime") => {
      const appError = toAppError(error, source);
      reportError(appError);
      return appError;
    },
    []
  );

  return { handleError };
};
