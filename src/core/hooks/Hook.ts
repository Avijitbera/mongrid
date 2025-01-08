

export abstract class Hook<T> {
    /**
     * Executes the hook logic.
     * @param data The document being processed.
     */
    abstract  execute(data: T): Promise<void> | void;
}