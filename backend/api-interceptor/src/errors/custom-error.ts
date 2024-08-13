import { ERROR_NAME, SERVER_ERRORS } from 'dconstant-error-type';

export class CustomError extends Error {
  code: ERROR_NAME | null = null 

  constructor(config: {
    msg?: string,
    name?: ERROR_NAME,
  }) {
    let message = typeof config.msg === 'string' ? (
      config.msg
    ) : (
      typeof config.name === 'number' ? (
        SERVER_ERRORS[config.name].desc
      ) : ''
    );
    super(message);
    const { name } = config;
    if (typeof name === 'number') {
      this.code = SERVER_ERRORS[name].code;
    } else {
      this.code = SERVER_ERRORS[ERROR_NAME.OTHER].code;
    }
    this.name = 'Custom Error';
  }
}