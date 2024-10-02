import Redis from "ioredis";
import { HttpMethod, IRegisteredEndpointRepo, RegisteredEndpoint } from "../contracts";
import { toDict } from "../common";
import { RedisMethodAndPathRepo } from "./redisMethodAndPathRepo";

export class RedisRegisteredEndpointRepo implements IRegisteredEndpointRepo {
    protected redis: Redis;
    protected methodAndPathRepo: RedisMethodAndPathRepo;

    static ID_TO_ENDPOINT = "id_to_endpoint"
    constructor(redis: Redis, methodAndPathRepo: RedisMethodAndPathRepo) {
        this.redis = redis
        this.methodAndPathRepo = methodAndPathRepo
    }

    getIdToEndpointKey(id: string) {
        return `${RedisRegisteredEndpointRepo.ID_TO_ENDPOINT}:${id}`;
    }

    async getByMethodAndPath(method: HttpMethod, path: string): Promise<RegisteredEndpoint | null> {
        const id = await this.methodAndPathRepo.getRegistrationId(method, path)
        if(!id){
            return null
        }
        return await this.get(id)

    }
    async get(id: string): Promise<RegisteredEndpoint | null> {
        const idToEndpointKey = this.getIdToEndpointKey(id)
        const endpointString = await this.redis.get(idToEndpointKey)
        if (!endpointString) {
            return null
        }
        return JSON.parse(endpointString)
    }
    async upsert(id: string, data: RegisteredEndpoint): Promise<RegisteredEndpoint> {
        await this.methodAndPathRepo.setRegistrationId(data.method, data.path, id)
        const idToEndpointKey = this.getIdToEndpointKey(id)
        await this.redis.set(idToEndpointKey, JSON.stringify(data));
        const endpoint = await this.get(id)
        if (!endpoint) {
            throw new Error("Data cannot be saved properly")
        }
        return endpoint
    }
    async remove(id: string): Promise<RegisteredEndpoint | null> {
        const endpoint = await this.get(id)
        if (!endpoint) {
            return null
        }
        const idToEndpointKey = this.getIdToEndpointKey(id)
        await this.redis.del(idToEndpointKey);
        await this.methodAndPathRepo.setRegistrationId(endpoint.method, endpoint.path, id)
        return endpoint

    }
    async getAllEndpointConfigKeys(): Promise<string[]> {
        let cursor = '0';
        let totalKeys: string[] = [];

        do {
            // Use SCAN to get keys with the endpoint prefix
            const result = await this.redis.scan(cursor, 'MATCH', `${RedisRegisteredEndpointRepo.ID_TO_ENDPOINT}*`, 'COUNT', 100);
            cursor = result[0];
            const keys = result[1];

            if (keys.length > 0) {
                totalKeys = totalKeys.concat(keys)
            }
        } while (cursor !== '0'); // Continue until cursor is 0 (end of iteration)

        return totalKeys;
    }

    async list(): Promise<RegisteredEndpoint[]> {
        const keys = await this.getAllEndpointConfigKeys()
        const results: RegisteredEndpoint[] = []
        const values = await this.redis.mget(keys);
        values.forEach(v => {
            if (!v) {
                return
            }
            results.push(JSON.parse(v));
        })
        return results
    }
    async map(): Promise<Record<string, RegisteredEndpoint>> {
        const list = await this.list()
        return toDict(list, x => x.id)
    }
    async clear(): Promise<string[]> {
        const keys = await this.getAllEndpointConfigKeys()
        await this.redis.del(...keys);
        return keys
    }

}