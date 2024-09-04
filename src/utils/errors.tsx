export interface ErrorType {
  error: number;
  message: string;
  reason?: string;
  field?: string;
}

export type SimpleError = {
  title: string;
  message: string;
  type?: 'warning' | 'error';
} | null;

export const buildError = (
  error: number,
  message: string,
  reason: string | undefined,
  field: string | undefined
): ErrorType => {
  return {
    error,
    message,
    reason,
    field
  };
};

export class CTError extends Error {
  error: number;
  reason: string | undefined;
  field: string | undefined;
  api?: string;

  constructor(
    error: number,
    message: string,
    reason: string | undefined = undefined,
    field: string | undefined = undefined
  ) {
    super(message);
    this.error = error;
    this.message = message;
    this.reason = reason;
    this.field = field;
  }

  toObject() {
    return buildError(this.error, this.message, this.reason, this.field);
  }
}

export const getMessageFromError = (error: number): string => {
  switch (error) {
    case 404:
      return 'invalid_resource';
    case 999:
      return 'unknown_error';
    case 1:
      return 'client_error';
    case 8:
      return 'email_already_exists';
    case 12:
      return 'contact_already_exists';
    case 15:
      return 'same_user';
    case 19:
      return 'invalid_licence';
    case 5:
      return 'invalid_username_or_password';
    case 18:
      return 'register_already_exists';
    case 22:
      return 'resouce_not_found';
    default:
      return '';
  }
};
