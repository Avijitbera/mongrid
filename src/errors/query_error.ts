import { BaseModelError } from "./base_error";

export class QueryError extends BaseModelError {
    
    getDetails(): Record<string, unknown>{
        return {
            type:'query',
            operation: this.operation,
            filter: this.filter,
            options: this.options,
            cause: this.cause
        }
    }
}
