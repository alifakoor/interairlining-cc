import { Context } from "fabric-contract-api";
import { Airline } from "./airline";

// ToDo implement and test update and delete methods
export class AirlinesService {
    private ctx: Context

    constructor(ctx: Context) {
        this.ctx = ctx
    }

    async exists(airlineId: string): Promise<boolean> {
        const airlineBuffer = await this.ctx.stub.getState(airlineId)
        if (airlineBuffer && airlineBuffer.length > 0) return true
        return false
    }

    async get(airlineId: string): Promise<Airline> {
        const airlineBuffer = await this.ctx.stub.getState(airlineId)
        const airline = JSON.parse(airlineBuffer.toString())
        return airline
    }

    async create(airlineId: string, name: string, country: string) {
        if (this.exists(airlineId)) {
            throw new Error(`Airline ${airlineId} already exists`)
        }

        const airline = new Airline(name, country)

        const airlineBuffer = Buffer.from(JSON.stringify(airline))

        await this.ctx.stub.putState(airlineId, airlineBuffer)
    }
}