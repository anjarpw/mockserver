import { ICrud, EndpointEvent, IEndpointEventRepo } from '../contracts';
import { BaseInMemoryRepo } from "./baseInMemory";

export class InMemoryEndpointEventListRepo extends BaseInMemoryRepo<EndpointEvent[]>{
    constructor(){
        super()
    }
}
export class InMemoryEndpointEventRepo implements IEndpointEventRepo {
    endpointEventListRepo: ICrud<EndpointEvent[]>
    constructor(endpointEventListRepo: ICrud<EndpointEvent[]>){        
        this.endpointEventListRepo = endpointEventListRepo
    }

    async add(event: EndpointEvent): Promise<EndpointEvent> {
        let existingEvents: (EndpointEvent[]) | null = await this.endpointEventListRepo.get(event.registrationId)
        
        if(!existingEvents){
            existingEvents = []
        }
        existingEvents.push(event)
        await this.endpointEventListRepo.upsert(event.registrationId, existingEvents)
        return event
    }
    async getByRegistrationId(registrationId: string): Promise<EndpointEvent[]> {
        let existingEvents: (EndpointEvent[]) | null = await this.endpointEventListRepo.get(registrationId)
        if(!existingEvents){
            existingEvents = []
        }
        return existingEvents
    }
    async clearByRegistrationId(registrationId: string): Promise<EndpointEvent[]> {
        let existingEvents: (EndpointEvent[]) | null = await this.endpointEventListRepo.remove(registrationId)
        if(!existingEvents){
            existingEvents = []
        }
        return existingEvents
    }

}