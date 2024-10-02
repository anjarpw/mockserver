import { ICrud, RegisteredEndpoint, IRegisteredEndpointRepo, HttpMethod, EndpointPath } from '../contracts';
import { BaseInMemoryRepo } from "./baseInMemory";

export class InMemoryRegisteredEndpointRepo extends BaseInMemoryRepo<RegisteredEndpoint> implements ICrud<RegisteredEndpoint>, IRegisteredEndpointRepo {
    

    httpPathToIdMap: Record<string, string>

    constructor(){
        super()
        this.httpPathToIdMap = {}
    }
    private toHttpPathKey(data: EndpointPath): string{
        return  data.method+"-"+data.path
    }

    protected override async onUpserted(id: string, data: RegisteredEndpoint): Promise<void> {
        const key = this.toHttpPathKey(data)
        this.httpPathToIdMap[key] = data.id
    }
    protected override async onRemoved(id: string, data: RegisteredEndpoint): Promise<void> {
        const key = this.toHttpPathKey(data)
        delete this.httpPathToIdMap[key]
    }

    async getByMethodAndPath(method: HttpMethod, path: string): Promise<RegisteredEndpoint | null> {
        const key = this.toHttpPathKey({method, path})
        const registrationId = this.httpPathToIdMap[key]
        if(!registrationId){
            return null
        }
        return await this.get(registrationId)

    }

}