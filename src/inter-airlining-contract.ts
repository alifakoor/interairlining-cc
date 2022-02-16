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
// ToDo get baggage by query (value) (this.ctx.stub.getQueryResult)
// ToDo Complete Test of procedure
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

    @Transaction(false)
    public async getBaggages(
        ctx: Context,
        field: string,
        condition: string,
        value: string
    ): Promise<Array<Baggage>> {

        const baggageService = new BaggageService(ctx);
        const result = await baggageService.getWithQuery(field, condition, value);

        return result;
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
        let order: Order = await orderService.get(orderId);
        if(!order) {
            throw new Error(`Order ${orderId} does not exist.`);
        }

        const airportService = new AirtportsService(ctx);
        const airlineService = new AirlinesService(ctx);

        // 3a- Agent Delivers baggage to srcAirport
        // src -> Agent
        // dsc -> srcAirport
        if(order.status === OrderStatusEnum.Created) {
            // verify dst exists among airports - optional
            // const existedAirport = await airportService.exists(dst);
            // if(!existedAirport) {
            //     throw new Error(`Source Airport ${dst} does not exist.`);
            // }

            // dst is equal to order.srcAirportId - required
            if(order.srcAirportId !== dst) {
                throw new Error(`Invalid destination: ${dst}`);
            }

            // update order status
            await orderService.updateStatus(orderId, OrderStatusEnum.ClaimedDeliveryToSrcAirport);
        }
        
        // 4a- srcAirport Delivers baggage to Airline
        // src -> srcAirport
        // dst -> Airline
        if(order.status === OrderStatusEnum.ConfirmedDeliveryToSrcAirport) {
            
            // src is equal to order.srcAirport
            if(order.srcAirportId !== src) {
                throw new Error(`Invalid source: ${src}`)
            }

            // dst is equal to order.Airline
            if(order.airlineId !== dst) {
                throw new Error(`Invalid destination: ${dst}`);
            }

            await orderService.updateStatus(orderId, OrderStatusEnum.ClaimedDeliveryToAirline);
        }
        
        // 5a- Airline Delivers baggage to dstAirport
        // src -> Airline
        // dst -> dstAirport
        if(order.status === OrderStatusEnum.ConfirmedDeliveryToAirline) {
            
            // src is equal to order.airline
            if(order.airlineId !== src) {
                throw new Error(`Invalid source: ${src}`)
            }

            // dst is equal to order.dstAirport
            if(order.dstAirportId !== dst) {
                throw new Error(`Invalid destination: ${dst}`);
            }

            await orderService.updateStatus(orderId, OrderStatusEnum.ClaimedDeliveryToDstAirport);
        }

        // 6a- dstAirport Delivers to endpoint
        // src -> dstAirport
        // dst -> endpoint
        if(order.status === OrderStatusEnum.ConfirmedDeliveryToDstAirport) {
            
            // src is equal to order.dstAirport
            if(order.dstAirportId !== src) {
                throw new Error(`Invalid source: ${src}`)
            }

            await orderService.updateStatus(orderId, OrderStatusEnum.ClaimedDeliveryToEndpoint);
        }
    }

    // ToDo Implement confirmDelivery
    @Transaction(true)
    public async confirmDelivery(ctx: Context, orderId: string, baggageId: string, src: string, dst: string): Promise<void> {
        const orderService = new OrderService(ctx);
        // check if order exist
        let order = await orderService.get(orderId);
        if(!order) {
            throw new Error(`Order ${orderId} does not exist.`);
        }

        if(order.baggageId !== baggageId) {
            throw new Error(`Invalid Baggage: ${baggageId}`);
        }

        const airportService = new AirtportsService(ctx);
        const airlineService = new AirlinesService(ctx);

        // 3b- srcAirport Confirms Delivery
        // confirmer -> srcAirport
        if(order.status === OrderStatusEnum.ClaimedDeliveryToSrcAirport) {
            
            // dst is equal to order.srcAirportId - required
            if(order.srcAirportId !== dst) {
                throw new Error(`Invalid destination: ${dst}`);
            }

            await orderService.updateStatus(orderId, OrderStatusEnum.ConfirmedDeliveryToSrcAirport);
        }

        // 4b- Airline Confirms Delivery
        // confirmer -> Airline
        if(order.status === OrderStatusEnum.ClaimedDeliveryToAirline) {

            // src is equal to order.srcAirport
            if(order.srcAirportId !== src) {
                throw new Error(`Invalid source: ${src}`)
            }

            // dst is equal to order.Airline
            if(order.airlineId !== dst) {
                throw new Error(`Invalid destination: ${dst}`);
            }

            await orderService.updateStatus(orderId, OrderStatusEnum.ConfirmedDeliveryToAirline);
        }

        // 5b- dstAirport Confirms Delivery
        // confirmer -> dstAirport
        if(order.status === OrderStatusEnum.ClaimedDeliveryToDstAirport) {

            // src is equal to order.airline
            if(order.airlineId !== src) {
                throw new Error(`Invalid source: ${src}`)
            }

            // dst is equal to order.dstAirport
            if(order.dstAirportId !== dst) {
                throw new Error(`Invalid destination: ${dst}`);
            }

            await orderService.updateStatus(orderId, OrderStatusEnum.ConfirmedDeliveryToDstAirport);
        }

        // 6b- endpoint Confirms Delivery
        // confirmer -> Airline
        if(order.status === OrderStatusEnum.ClaimedDeliveryToEndpoint) {
            
            // src is equal to order.dstAirport
            if(order.dstAirportId !== src) {
                throw new Error(`Invalid source: ${src}`)
            }

            await orderService.updateStatus(orderId, OrderStatusEnum.ConfirmedDeliveryToEndpoint);
        }
    }
}
