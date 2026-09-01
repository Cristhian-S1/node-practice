export type ErrorType = "STADIUM" | "TEAM" | "MATCH" | "VALIDATION" | "GENERAL";

export class AppError extends Error {
  readonly statusCode: number;
  readonly type: ErrorType;
  readonly code?: string; // codigo PG opcional, ej: "23505"

  constructor(
    message: string,
    statusCode: number,
    type: ErrorType,
    code?: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.code = code;

    // Necesario para que instanceof funcione correctamente en TypeScript
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
