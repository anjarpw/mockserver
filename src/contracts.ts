export type SerializedHttpRequest = {
    headers: any
    url: string
    method: HttpMethod
    query: any
    body: any
    path: string
    params: any
}


export type MockResponseConfig = {
    code: number
    delay: number
    body: any
}
export type OnCompletedResponse = "backToFirst" | "useLastResponse"
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';


export type EndpointPath = {
    method: HttpMethod
    path: string
}

export type EndpointRegistrationRequest = {
    whenCompleted: OnCompletedResponse
    returns: MockResponseConfig[]
} & EndpointPath

export type RegisteredEndpoint = {
    id: string
} & EndpointRegistrationRequest


export type EndpointEvent = {
    registrationId: string
    request: SerializedHttpRequest
    response: MockResponseConfig
    requestedAt: Date
    completedAt: Date
}
export type HistoricalEndpointInformation = {
    id: string
    method: HttpMethod
    path: string
    whenCompleted: OnCompletedResponse
    events: EndpointEvent[]
}

export interface IEndpointManager {
    tryHandlingRequest(request: SerializedHttpRequest): Promise<MockResponseConfig>;
    register(id: string, reg: EndpointRegistrationRequest): Promise<RegisteredEndpoint>
    reset(id: string): Promise<RegisteredEndpoint>
    get(id: string): Promise<HistoricalEndpointInformation | null>
    getByMethodAndPath(method: HttpMethod, path: string): Promise<HistoricalEndpointInformation | null>
    remove(id: string): Promise<RegisteredEndpoint | null>
    map(): Promise<Record<string, EndpointPath>>
    clear(): Promise<string[]>
}

export interface ICrud<T> {
    get(id: string): Promise<T | null>
    upsert(id: string, data: T): Promise<T>
    remove(id: string): Promise<T | null>
    list(): Promise<T[]>
    map(): Promise<Record<string, T>>
    clear(): Promise<string[]>
}
export interface IRegisteredEndpointRepo extends ICrud<RegisteredEndpoint> {
    getByMethodAndPath(method: HttpMethod, path: string): Promise<RegisteredEndpoint | null>
}

export interface IEndpointEventRepo {
    add(event: EndpointEvent): Promise<EndpointEvent>
    getByRegistrationId(registrationId: string): Promise<EndpointEvent[]>
    clearByRegistrationId(registrationId: string): Promise<EndpointEvent[]>

}