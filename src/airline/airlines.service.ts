import { Context } from "fabric-contract-api";
import { Airline } from "./airline";

// ToDo implement and test update and delete methods
export class AirlinesService {
    private ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    async exists(airlineId: string): Promise<boolean> {
        const airlineBuffer: Uint8Array = await this.ctx.stub.getState(airlineId);
        return (!!airlineBuffer && airlineBuffer.length > 0);
    }

    async get(airlineId: string): Promise<Airline> {
        const airlineBuffer: Uint8Array = await this.ctx.stub.getState(airlineId);
        const airline = JSON.parse(airlineBuffer.toString());
        return airline;
    }

    async create(airlineId: string, name: string, country: string): Promise<void> {
        console.log(`Create New Airline ${airlineId}`, name, country);

        const existedAirline: boolean = await this.exists(airlineId);
        if (existedAirline) {
            throw new Error(`Airline ${airlineId} already exists`);
        }

        let airline = new Airline();
        airline = {
            name,
            country
        };

        const airlineBuffer = Buffer.from(JSON.stringify(airline));

        await this.ctx.stub.putState(airlineId, airlineBuffer);
    }

    async updateName(airlineId: string, newName: string): Promise<void> {
        console.log(`Update Name Airline: ${airlineId}`, newName);

        // const existedAirline: boolean = await this.exists(airlineId);
        // if(!existedAirline) {
        //     throw new Error(`Airline ${airlineId} does not existed.`);
        // }

        let airline = await this.get(airlineId);
        airline.name = newName;

        const airlineBuffer = Buffer.from(JSON.stringify(airline));

        await this.ctx.stub.putState(airlineId, airlineBuffer);
    }

    async updateCountry(airlineId: string, newCountry: string): Promise<void> {
        console.log(`Update Country Airline: ${airlineId}`, newCountry);

        let airline = await this.get(airlineId);
        airline.name = newCountry;

        const airlineBuffer = Buffer.from(JSON.stringify(airline));

        await this.ctx.stub.putState(airlineId, airlineBuffer);
    }

    async delete(airlineId: string): Promise<void> {
        await this.ctx.stub.deleteState(airlineId);
    }
}