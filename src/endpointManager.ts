import { EndpointEvent, SerializedHttpRequest, EndpointRegistrationRequest, HistoricalEndpointInformation, HttpMethod, IEndpointEventRepo, IEndpointManager, IRegisteredEndpointRepo, MockResponseConfig, RegisteredEndpoint, EndpointPath } from './contracts';
import { delay } from './common';


export class EndpointManager implements IEndpointManager {

    private endpointRegistrationRepo: IRegisteredEndpointRepo
    private endpointEventRepo: IEndpointEventRepo

    constructor(endpointRegistrationRepo: IRegisteredEndpointRepo, endpointEventRepo: IEndpointEventRepo) {
        this.endpointRegistrationRepo = endpointRegistrationRepo
        this.endpointEventRepo = endpointEventRepo
    }
    async tryHandlingRequest(request: SerializedHttpRequest): Promise<MockResponseConfig> {
        const { method, path } = request
        const requestedAt = new Date()
        const reg = await this.endpointRegistrationRepo.getByMethodAndPath(method as HttpMethod, path)
        if (!reg) {
            throw new Error("not found")
        }
        const pastEvents = await this.endpointEventRepo.getByRegistrationId(reg.id)
        let currentResponse: MockResponseConfig = reg.returns[pastEvents.length % reg.returns.length]

        if (pastEvents.length >= reg.returns.length && reg.whenCompleted == 'useLastResponse') {
            currentResponse = reg.returns[reg.returns.length - 1]
        }
        await delay(currentResponse.delay)
        const completedAt = new Date()
        const event: EndpointEvent = {
            requestedAt,
            completedAt,
            response: currentResponse,
            request,
            registrationId: reg.id
        }
        await this.endpointEventRepo.add(event)
        return currentResponse
    }
    async getByMethodAndPath(method: HttpMethod, path: string): Promise<HistoricalEndpointInformation | null> {
        const data = await this.endpointRegistrationRepo.getByMethodAndPath(method, path)
        if (!data) {
            return null
        }
        const events = await this.endpointEventRepo.getByRegistrationId(data.id)
        return {
            ...data,
            events
        }
    }
    async clear(): Promise<string[]> {
        const keys = await this.endpointRegistrationRepo.clear()
        return keys
    }

    async register(id: string, data: EndpointRegistrationRequest): Promise<RegisteredEndpoint> {
        const registeredEndpoint = await this.endpointRegistrationRepo.upsert(id, {
            id,
            ...data
        })
        await this.endpointEventRepo.clearByRegistrationId(id)
        return registeredEndpoint
    }
    async reset(id: string): Promise<RegisteredEndpoint> {
        const data = await this.endpointRegistrationRepo.get(id)
        if (!data) {
            throw new Error("Not registered")
        }
        await this.endpointEventRepo.clearByRegistrationId(id)
        return data
    }
    async get(id: string): Promise<HistoricalEndpointInformation | null> {
        const data = await this.endpointRegistrationRepo.get(id)
        if (!data) {
            return null
        }
        const events = await this.endpointEventRepo.getByRegistrationId(id)
        return {
            ...data,
            events
        }
    }
    async remove(id: string): Promise<RegisteredEndpoint | null> {
        return await this.endpointRegistrationRepo.remove(id)
    }
    async map(): Promise<Record<string, EndpointPath>> {
        const map = await this.endpointRegistrationRepo.map()
        const newMap: Record<string, EndpointPath> = {}
        Object.keys(map).forEach(key => {
            const { path, method } = map[key]
            newMap[key] = {
                path, method
            }
        })
        return newMap
    }

}