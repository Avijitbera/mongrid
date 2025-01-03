import { BaseModelError } from './base_error';

export class DeleteError extends BaseModelError {
  getDetails(): Record<string, unknown> {
    return {
      type: 'delete',
      operation: this.operation,
      filter: this.filter,
      options: this.options,
      cause: this.cause,
    };
  }
}