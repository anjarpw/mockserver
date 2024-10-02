import Redis from "ioredis";
import { EndpointEvent, IEndpointEventRepo } from "../contracts";
import { RedisMethodAndPathRepo } from "./redisMethodAndPathRepo";

export class RedisEndpointEventRepo implements IEndpointEventRepo {
    redis: Redis;
    protected methodAndPathRepo: RedisMethodAndPathRepo;

    static EVENT_ENDPOINT = "event_endpoint"
    constructor(redis: Redis, methodAndPathRepo: RedisMethodAndPathRepo) {
        this.redis = redis
        this.methodAndPathRepo = methodAndPathRepo
    }    
    async add(event: EndpointEvent): Promise<EndpointEvent> {
        const registrationKey = this.getIdToEventKey(event.registrationId)
        await this.redis.lpush(registrationKey, JSON.stringify(event))
        return event
    }
    async getByRegistrationId(registrationId: string): Promise<EndpointEvent[]> {
        const registrationKey = this.getIdToEventKey(registrationId)
        const data = await this.redis.lrange(registrationKey, 0, -1)
        return data.map(x => JSON.parse(x))
    }
    async clearByRegistrationId(registrationId: string): Promise<EndpointEvent[]> {
        const registrationKey = this.getIdToEventKey(registrationId)
        const event = await this.getByRegistrationId(registrationId)
        await this.redis.del(registrationKey)
        return event
    }

    getIdToEventKey(id: string) {
        return `${RedisEndpointEventRepo.EVENT_ENDPOINT}:${id}`;
    }

}