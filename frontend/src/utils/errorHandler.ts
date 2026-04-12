import axios from "axios";

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  source: "api" | "socket" | "ui" | "runtime";
  details?: unknown;
}

export const toAppError = (
  error: unknown,
  source: AppError["source"]
): AppError => {
  if (axios.isAxiosError(error)) {
    return {
      source,
      message:
        (error.response?.data as { message?: string } | undefined)?.message ||
        error.message ||
        "Request failed",
      status: error.response?.status,
      code: error.code,
      details: error.response?.data,
    };
  }

  if (error instanceof Error) {
    return {
      source,
      message: error.message,
      details: error.stack,
    };
  }

  if (typeof error === "string") {
    return {
      source,
      message: error,
    };
  }

  return {
    source,
    message: "Unexpected error",
    details: error,
  };
};

export const reportError = (appError: AppError): void => {
  // Centralized place for logging and future integration with Sentry/Datadog.
  console.error("[APP ERROR]", appError);
};
