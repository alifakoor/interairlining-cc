import { Context } from "fabric-contract-api";
import { Airport } from "./airport";

// ToDo Implement and test update && delete methods
export class AirtportsService {
    private ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    async exists(airportId: string): Promise<boolean> {
        const airportBuffer = await this.ctx.stub.getState(airportId);
        return (!!airportBuffer && airportBuffer.length > 0);
    }

    async get(airportId: string): Promise<Airport> {
        const airportBuffer = await this.ctx.stub.getState(airportId);
        const airport = JSON.parse(airportBuffer.toString());
        return airport;
    }

    async create(airportId: string, name: string, location: string): Promise<void> {
        console.log(`Create New Airport ${airportId}`, name, location);

        if (await this.exists(airportId)) {
            throw new Error(`Airport ${airportId} already exists`);
        }

        let airport = new Airport();
        airport = {
            name,
            location
        };

        // db.pudState(airportId, airport)

        const airportBuffer = Buffer.from(JSON.stringify(airport));

        await this.ctx.stub.putState(airportId, airportBuffer);
    }

    async updateName(airportId: string, newName: string): Promise<void> {
        console.log(`Update Name Airport: ${airportId}`, newName);

        let airport = await this.get(airportId);
        airport.name = newName;

        const airportBuffer = Buffer.from(JSON.stringify(airport));

        await this.ctx.stub.putState(airportId, airportBuffer);
    }

    async updateLocation(airportId: string, newLocation: string): Promise<void> {
        console.log(`Update Location Airport: ${airportId}`, newLocation);

        let airport = await this.get(airportId);
        airport.name = newLocation;

        const airportBuffer = Buffer.from(JSON.stringify(airport));

        await this.ctx.stub.putState(airportId, airportBuffer);
    }

    async delete(airportId: string): Promise<void> {
        await this.ctx.stub.deleteState(airportId);
    }
}
