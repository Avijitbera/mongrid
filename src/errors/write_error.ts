import { BaseModelError } from './base_error';

export class WriteError extends BaseModelError {
  getDetails(): Record<string, unknown> {
    return {
      type: 'write',
      operation: this.operation,
      filter: this.filter,
      options: this.options,
      cause: this.cause,
    };
  }
}