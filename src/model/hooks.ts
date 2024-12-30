
export class ModelHooks<T> {
    private preHooks: Map<string, Function[]> = new Map();
    private postHooks: Map<string, Function[]> = new Map();

    pre(hook:string, fn: Function): void{
        const hooks = this.preHooks.get(hook) || [];
        hooks.push(fn);
        this.preHooks.set(hook, hooks);
    }

    post(hook:string, fn: Function): void{
        const hooks = this.postHooks.get(hook) || [];
        hooks.push(fn);
        this.postHooks.set(hook, hooks);
    }
    async executePostHooks(hook:string, data:any): Promise<any> {
        const hooks = this.postHooks.get(hook) || [];
        let result = data;
        for (const fn of hooks) {
            result = await fn(data);
        }
        return result
    }

    async executePreHooks(hook:string, data:any): Promise<any> {
        const hooks = this.preHooks.get(hook) || [];
        let result = data;
        for (const fn of hooks) {
            result = await fn(data);
        }
        return result
    }
}
