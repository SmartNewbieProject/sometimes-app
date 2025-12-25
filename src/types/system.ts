export type ServerError = {
  error: string;
  status: number;
  statusCode?: number;
  message?: string;
  success?: boolean;
  errorCode?: string;
  details?: Record<string, unknown>;
};
