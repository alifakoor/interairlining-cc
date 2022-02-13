import { Context } from "fabric-contract-api";
import { Baggage } from "./baggage";

export class BaggageService {
    private ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    async exists(baggageId: string): Promise<boolean> {
        const baggageBuffer: Uint8Array = await this.ctx.stub.getState(baggageId);
        return (!!baggageBuffer && baggageBuffer.length > 0);
    }

    async get(baggageId: string): Promise<Baggage> {
        const baggageBuffer: Uint8Array = await this.ctx.stub.getState(baggageId);
        const baggage: Baggage = JSON.parse(baggageBuffer.toString());

        console.log(`Get Baggage ${baggageId}`, baggage);

        return baggage;
    }

    async create(baggageId: string, owner: string, weight: string, value: string): Promise<void> {
        console.log(`Create New Baggage ${baggageId}`, owner, weight, value);

        const existedBaggage: boolean = await this.exists(baggageId);
        if (existedBaggage) {
            throw new Error(`Baggage ${baggageId} already exists`);
        }

        let baggage = new Baggage();
        baggage = {
            owner,
            weight: +weight,
            value: +value
        };

        const baggageBuffer = Buffer.from(JSON.stringify(baggage));

        await this.ctx.stub.putState(baggageId, baggageBuffer);
    }

    public async updateOwner(baggageId: string, newOwner: string): Promise<void> {
        console.log(`Update Owner Baggage ID: ${baggageId}`, newOwner);

        // const existedBaggage: boolean = await this.exists(baggageId);
        // if(!existedBaggage) {
        //     throw new Error(`Baggage ${baggageId} does not existed.`);
        // }

        let baggage = await this.get(baggageId);
        baggage.owner = newOwner;

        const baggageBuffer = Buffer.from(JSON.stringify(baggage));

        await this.ctx.stub.putState(baggageId, baggageBuffer);
    }

    public async updateWeight(baggageId: string, newWeight: string): Promise<void> {
        console.log(`Update Weight Baggage ID: ${baggageId}`, newWeight);

        let baggage = await this.get(baggageId);
        baggage.weight = +newWeight;

        const baggageBuffer = Buffer.from(JSON.stringify(baggage));

        await this.ctx.stub.putState(baggageId, baggageBuffer);
    }

    public async updateValue(baggageId: string, newValue: string): Promise<void> {
        console.log(`Update Value Baggage ID: ${baggageId}`, newValue);

        let baggage = await this.get(baggageId);
        baggage.value = +newValue;

        const baggageBuffer = Buffer.from(JSON.stringify(baggage));

        await this.ctx.stub.putState(baggageId, baggageBuffer);
    }

    async delete(baggageId: string): Promise<void> {
        await this.ctx.stub.deleteState(baggageId);
    }
}