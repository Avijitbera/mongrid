
export abstract class Validator<T> {
    /**
     * The error message to return if validation fails.
     */
    abstract message: string;
    /**
     * Validates the given value.
     * @param value The value to validate.
     * @returns `true` if the value is valid, `false` otherwise.
     */
    abstract validate(value: T): boolean
}
