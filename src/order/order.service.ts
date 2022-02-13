import { Context } from "fabric-contract-api";
import { Order, OrderStatusEnum } from "./order";

export class OrderService {
    private ctx: Context;

    constructor(ctx: Context) {
        this.ctx = ctx;
    }

    public async exists(orderId: string): Promise<boolean> {
        const data: Uint8Array = await this.ctx.stub.getState(orderId);
        return (!!data && data.length > 0);
    }

    public async get(orderId: string): Promise<Order> {
        const orderBuffer = await this.ctx.stub.getState(orderId);
        const order = JSON.parse(orderBuffer.toString());
        return order;
    }

    public async create(
        orderId: string,
        baggageId: string,
        srcAirportId: string,
        dstAirportId: string,
        airlineId: string,
        flightNo: string,
        status: OrderStatusEnum
    ): Promise<void> {
        const existedOrder = await this.exists(orderId);
        if (existedOrder) {
            throw new Error(`Order ${orderId} already exists`);
        }

        let order = new Order();
        order = {
            baggageId,
            srcAirportId,
            dstAirportId,
            airlineId,
            flightNo,
            status
        };

        const orderBuffer = Buffer.from(JSON.stringify(order));

        await this.ctx.stub.putState(orderId, orderBuffer);
    }

    // ToDo implement update method
    public async updateFlightNo(orderId: string, newFlightNo: string): Promise<void> {
        console.log(`Update Filght Number Order: ${orderId}`, newFlightNo);

        let order = await this.get(orderId);
        order.flightNo = newFlightNo;

        const orderBuffer = Buffer.from(JSON.stringify(order));

        await this.ctx.stub.putState(orderId, orderBuffer);
    }

    public async updateStatus(orderId: string, newStatus: OrderStatusEnum): Promise<void> {
        console.log(`Update Status Order: ${orderId}`, newStatus);

        let order = await this.get(orderId);
        order.status = newStatus;

        const orderBuffer = Buffer.from(JSON.stringify(order));

        await this.ctx.stub.putState(orderId, orderBuffer);
    }

    // ToDo implement delete method
    public async delete(orderId: string): Promise<void> {
        await this.ctx.stub.deleteState(orderId);
    }
}
