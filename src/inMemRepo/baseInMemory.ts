import { ICrud } from "../contracts";

export class BaseInMemoryRepo<T> implements ICrud<T> {

    protected async onUpserted(id: string, data: T){

    }
    protected async onRemoved(id: string, data: T){

    }
    protected data: Record<string, T>
    constructor() {
        this.data = {}
    }
    async clear(): Promise<string[]> {
        const keys =  Object.keys(this.data)
        this.data = {}
        return keys
    }

    async get(id: string): Promise<T | null> {
        return this.data[id]
    }
    async upsert(id: string, data: T): Promise<T> {
        this.data[id] = data
        this.onUpserted(id, data)
        return data
    }
    async remove(id: string): Promise<T | null> {
        const item = this.data[id]
        delete this.data[id]
        this.onRemoved(id, item)
        return item
    }
    async list(): Promise<T[]> {
        return Object.values(this.data)
    }
    async map(): Promise<Record<string, T>> {
        return { ...this.data }
    }

}