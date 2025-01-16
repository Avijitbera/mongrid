export class Mongird extends Error {
    constructor(message:string, public code:string, public details?:any){
        super(message);
        this.name = 'MongirdError';
    }

}

export const ERROR_CODES = {
    DATABASE_CONNECTION_FAILED:'DATABASE_CONNECTION_FAILED',
    VALIDATION_ERROR:'VALIDATION_ERROR',
    TRANSACTION_ERROR:'TRANSACTION_ERROR',
    QUERY_EXECUTION_ERROR:'QUERY_EXECUTION_ERROR',
    HOOK_EXECUTION_ERROR:'HOOK_EXECUTION_ERROR',

}

