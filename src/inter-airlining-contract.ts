/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract,Info, Returns, Transaction } from "fabric-contract-api";
import { AirlinesService } from "./airline/airlines.service";
import { AirtportsService } from "./airports/airports.service";
import { Baggage } from "./baggage/baggage";
import { BaggageService } from "./baggage/baggage.service";
import { Order, OrderStatusEnum } from "./order/order";
import { OrderService } from "./order/order.service";

// ToDo Test before/afterTransaction logs using fabric samples network
// ToDo implement and test transaction methods
@Info({ title: "InterAirliningContract", description: "My Smart Contract" })
export class InterAirliningContract extends Contract {
    
    public async beforeTransaction(ctx: Context): Promise<void> {
        // IDxxx called fn: funcName, params: ...
        const id = ctx.clientIdentity.getID();
        const mspId = ctx.clientIdentity.getMSPID();
        const { fcn: methodName, params: methodParms } = ctx.stub.getFunctionAndParameters();

        console.log(`Identity: ${id} From ${mspId} Calls Function: ${methodName} with Params: ${methodParms}.`);
    }

    public async afterTransaction(ctx: Context, result: any): Promise<void> {
        console.log(`Result: ${result}`);
    }

    /*
    ********** Baggage's Methods **********
    */
    @Transaction(false)
    @Returns("boolean")
    public async baggageExists(ctx: Context, baggageId: string): Promise<boolean> {
        const baggageService = new BaggageService(ctx);
        return await baggageService.exists(baggageId);
    }

    @Transaction(false)
    @Returns("Baggage")
    public async getBaggage(ctx: Context, baggageId: string): Promise<Baggage> {
        const baggageService = new BaggageService(ctx);
        const baggage = await baggageService.get(baggageId);
        return baggage;
    }

    @Transaction(true)
    public async createBaggage(
        ctx: Context,
        baggageId: string,
        owner: string,
        weight: string,
        value: string
    ): Promise<void> {
        const baggageService = new BaggageService(ctx);
        await baggageService.create(baggageId, owner, weight, value);
        // events tx
        const eventData = { baggageId, owner, weight, value };
        ctx.stub.setEvent(
            "BaggageCreated",
            Buffer.from(JSON.stringify(eventData))
        );
    }

    @Transaction(true)
    public async updateBaggageOwner(
        ctx: Context,
        baggageId: string,
        newOwner: string
    ): Promise<void> {
        const baggageService = new BaggageService(ctx);
        await baggageService.updateOwner(baggageId, newOwner);
    }

    @Transaction(true)
    public async updateBaggageValue(
        ctx: Context,
        baggageId: string,
        newValue: string
    ): Promise<void> {
        const baggageService = new BaggageService(ctx);
        await baggageService.updateValue(baggageId, newValue);
    }

    @Transaction(true)
    public async updateBaggageWeight(
        ctx: Context,
        baggageId: string,
        newWeight: string
    ): Promise<void> {
        const baggageService = new BaggageService(ctx);
        await baggageService.updateWeight(baggageId, newWeight);
    }

    @Transaction(true)
    public async deleteBaggage(ctx: Context, baggageId: string): Promise<void> {
        const baggageService = new BaggageService(ctx);
        await baggageService.delete(baggageId);
    }

    /*
    ********** Airline's Methods **********
    */
    @Transaction(true)
    public async createAirline(
        ctx: Context,
        airlineId: string,
        name: string,
        country: string
    ): Promise<void> {
        const airline = new AirlinesService(ctx);
        await airline.create(airlineId, name, country);
    }

    /*
    ********** Airport's Methods **********
    */
    @Transaction(true)
    public async createAirport(
        ctx: Context,
        airportId: string,
        name: string,
        location: string
    ): Promise<void> {
        const airport = new AirtportsService(ctx);
        await airport.create(airportId, name, location);
    }

    /*
    ********** Order's Methods **********
    */
    @Transaction(true)
    public async createOrder(
        ctx: Context,
        orderId: string,
        baggageId: string,
        srcAirportId: string,
        dstAirportId: string,
        airlineId: string,
        flightNo: string
    ): Promise<void> {
        const orderService = new OrderService(ctx);
        await orderService.create(
            orderId,
            baggageId,
            srcAirportId,
            dstAirportId,
            airlineId,
            flightNo,
            OrderStatusEnum.Created
        );

        // raise event for order created
        let order = new Order();
        order = {
            baggageId,
            srcAirportId,
            dstAirportId,
            airlineId,
            flightNo,
            status: OrderStatusEnum.Created
        };

        const orderEventData = {
            orderId,
            ...order,
        };
        const orderEventBuffer = Buffer.from(JSON.stringify(orderEventData));
        ctx.stub.setEvent("OrderCreated", orderEventBuffer);
    }

    // ToDo Implement claimDelivery
    @Transaction(true)
    public async claimDelivery(ctx: Context, orderId: string, src: string, dst: string): Promise<void> {

        const orderService = new OrderService(ctx);
        // check if order exist
        const existedOrder = await orderService.exists(orderId);
        if(!existedOrder) {
            throw new Error(`Order ${orderId} does not exist.`);
        }

        let order = await orderService.get(orderId);

        const airportService = new AirtportsService(ctx);
        const airlineService = new AirlinesService(ctx);

        // 3a- Agent Delivers baggage to srcAirport
        // src -> Agent
        // dsc -> srcAirport
        if(order.status === OrderStatusEnum.Created) {
            const existedAirport = await airportService.exists(dst);
            if(!existedAirport) {
                throw new Error(`Source Airport ${dst} does not exist.`)
            }

            await orderService.updateStatus(orderId, OrderStatusEnum.ClaimedDeliveryToSrcAirport);
        }
        
        // 4a- srcAirport Delivers baggage to Airline
        // src -> srcAirport
        // dst -> Airline
        if(order.status === OrderStatusEnum.ClaimedDeliveryToSrcAirport) {
            const existedSrcAirport = await airportService.exists(src);
            if(!existedSrcAirport) {
                throw new Error(`srcAirport ${src} does not exist.`)
            }

            const existedAirline = await airlineService.exists(dst);
            if(!existedAirline) {
                throw new Error(`Airline ${dst} does not exist.`)
            }

            await orderService.updateStatus(orderId, OrderStatusEnum.ClaimedDeliveryToAirline);
        }
        
        // 5a- Airline Delivers baggage to dstAirport
        // src -> Airline
        // dst -> dstAirport
        if(order.status === OrderStatusEnum.ClaimedDeliveryToAirline) {
            const existedAirline = await airlineService.exists(src);
            if(!existedAirline) {
                throw new Error(`Airline ${src} does not exist.`)
            }

            const existedDstAirport = await airportService.exists(dst);
            if(!existedDstAirport) {
                throw new Error(`dstAirport ${src} does not exist.`)
            }

            await orderService.updateStatus(orderId, OrderStatusEnum.ClaimedDeliveryToDstAirport);
        }

        // 6a- dstAirport Delivers to endpoint
        // src -> dstAirport
        // dst -> endpoint
        if(order.status === OrderStatusEnum.ClaimedDeliveryToDstAirport) {
            const existedAirport = await airportService.exists(src);
            if(!existedAirport) {
                throw new Error(`Destination Airport ${src} does not exist.`)
            }

            await orderService.updateStatus(orderId, OrderStatusEnum.ClaimedDeliveryToEndpoint);
        }
    }

    // ToDo Implement confirmDelivery
    @Transaction(true)
    public async confirmDelivery(ctx: Context, orderId: string): Promise<void> {
        const orderService = new OrderService(ctx);
        // check if order exist
        const existedOrder = await orderService.exists(orderId);
        if(!existedOrder) {
            throw new Error(`Order ${orderId} does not exist.`);
        }

        let order = await orderService.get(orderId);

        const airportService = new AirtportsService(ctx);
        const airlineService = new AirlinesService(ctx);

        // 3b- srcAirport Confirms Delivery
        // confirmer -> srcAirport
        if(order.status === OrderStatusEnum.ClaimedDeliveryToSrcAirport) {
            await orderService.updateStatus(orderId, OrderStatusEnum.ConfirmedDeliveryToSrcAirport);
        }

        // 4b- Airline Confirms Delivery
        // confirmer -> Airline
        if(order.status === OrderStatusEnum.ClaimedDeliveryToAirline) {
            await orderService.updateStatus(orderId, OrderStatusEnum.ConfirmedDeliveryToAirline);
        }

        // 5b- dstAirport Confirms Delivery
        // confirmer -> dstAirport
        if(order.status === OrderStatusEnum.ClaimedDeliveryToDstAirport) {
            await orderService.updateStatus(orderId, OrderStatusEnum.ConfirmedDeliveryToDstAirport);
        }

        // 6b- endpoint Confirms Delivery
        // confirmer -> Airline
        if(order.status === OrderStatusEnum.ClaimedDeliveryToEndpoint) {
            await orderService.updateStatus(orderId, OrderStatusEnum.ConfirmedDeliveryToEndpoint);
        }
    }
}
