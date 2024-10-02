import Redis from "ioredis";
import { HttpMethod } from "../contracts";

export class RedisMethodAndPathRepo {
    redis: Redis;

    static PATH_TO_ID = "path_to_id"
    constructor(redis: Redis) {
        this.redis = redis
    }

    private getPathToIdKey(method: HttpMethod, path: string): string {
        return `${RedisMethodAndPathRepo.PATH_TO_ID}:${method}:${path}`;
    }
    async getRegistrationId(method: HttpMethod, path: string): Promise<string | null> {
        const pathToIdKey = this.getPathToIdKey(method, path)
        const id = await this.redis.get(pathToIdKey);
        if (!id) {
            return null
        }
        return id
    }
    async removeRegistrationId(method: HttpMethod, path: string): Promise<void> {
        const pathToIdKey = this.getPathToIdKey(method, path)
        const id = await this.redis.del(pathToIdKey);
    }
    async setRegistrationId(method: HttpMethod, path: string, registrationId: string): Promise<void> {
        const pathToIdKey = this.getPathToIdKey(method, path)
        await this.redis.set(pathToIdKey, registrationId);
    }
}