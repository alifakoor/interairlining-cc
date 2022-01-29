import { Context } from "fabric-contract-api";
import { Baggage } from "./baggage";

export class BaggageService {
    private ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx
    }

    async exists(baggageId: string): Promise<boolean> {
        const data: Uint8Array = await this.ctx.stub.getState(baggageId);
        return (!!data && data.length > 0);
    }

    async get(baggageId: string) {
        const baggageBuffer = await this.ctx.stub.getState(baggageId)
        const baggage: Baggage = JSON.parse(baggageBuffer.toString())

        console.log(`Get Baggage ${baggageId}`, baggage)

        return baggage
    }

    async create(baggageId: string, owner: string, weight: string, value: string) {
        console.log(`Create New Baggage ${baggageId}`, owner, weight, value)

        if (await this.exists(baggageId)) {
            throw new Error(`Baggage ${baggageId} already exists`)
        }

        let baggage = new Baggage()
        baggage = {
            owner,
            weight: +weight,
            value: +value
        }

        const baggageBuffer = Buffer.from(JSON.stringify(baggage))

        await this.ctx.stub.putState(baggageId, baggageBuffer)
    }

    public async updateOwner(baggageId: string, newOwner: string) {
        let baggage = await this.get(baggageId)
        baggage.owner = newOwner

        const baggageBuffer = Buffer.from(JSON.stringify(baggage))

        await this.ctx.stub.putState(baggageId, baggageBuffer)
    }

    public async updateWeight(baggageId: string, newWeight: string) {
        let baggage = await this.get(baggageId)
        baggage.weight = +newWeight

        const baggageBuffer = Buffer.from(JSON.stringify(baggage))

        await this.ctx.stub.putState(baggageId, baggageBuffer)
    }

    public async updateValue(baggageId: string, newValue: string) {
        let baggage = await this.get(baggageId)
        baggage.value = +newValue

        const baggageBuffer = Buffer.from(JSON.stringify(baggage))

        await this.ctx.stub.putState(baggageId, baggageBuffer)
    }

    async delete(baggageId: string) {
        await this.ctx.stub.deleteState(baggageId)
    }
}