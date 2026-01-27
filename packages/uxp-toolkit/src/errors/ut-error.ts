export class UTError extends Error {
  constructor(message: string, opts: ErrorOptions = {}) {
    super(message, opts);
    this.name = "UTError";
  }
}