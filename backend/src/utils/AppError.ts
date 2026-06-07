export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errors?: unknown[],
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: unknown[]): AppError {
    return new AppError(400, message, errors);
  }

  static unauthorized(message = "Unauthorized"): AppError {
    return new AppError(401, message);
  }

  static forbidden(message = "Forbidden"): AppError {
    return new AppError(403, message);
  }

  static notFound(message = "Not found"): AppError {
    return new AppError(404, message);
  }

  static conflict(message: string): AppError {
    return new AppError(409, message);
  }

  static internal(message = "Internal server error"): AppError {
    return new AppError(500, message);
  }
}
