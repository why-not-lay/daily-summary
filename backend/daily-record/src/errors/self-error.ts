export class SelfError extends Error {
  code: string = ''
  constructor(message: string, code: string) {
    super(message);
    this.name = 'Custom Error';
    this.code = code;
  }
}