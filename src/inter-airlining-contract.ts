/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Baggage } from './baggage/baggage'
import { BaggageService } from './baggage/baggage.service';
import * as shim from 'fabric-shim';

// ToDo Test before/afterTransaction logs using fabric samples network
// ToDo implement and test transaction methods
@Info({title: 'InterAirliningContract', description: 'My Smart Contract' })
export class InterAirliningContract extends Contract {
    public async beforeTransaction(ctx: Context): Promise<void> {
        // IDxxx called fn: funcName, params: ...
        const { fcn: methodName, params: methodParms } = ctx.stub.getFunctionAndParameters()
        const id = ctx.clientIdentity.getID()
        const mspId = ctx.clientIdentity.getMSPID()

        console.log(`Function: ${methodName}, Params: ${methodParms} Called by Id: ${id} From ${mspId}`)
    }

    public async afterTransaction(ctx: Context, result: any): Promise<void> {
        console.log(`Result: ${result}`)
    }

    @Transaction(false)
    @Returns('boolean')
    public async baggageExists(ctx: Context, baggageId: string): Promise<boolean> {
        const baggageService = new BaggageService(ctx)
        return await baggageService.exists(baggageId)
    }

    @Transaction(false)
    @Returns('Baggage')
    public async getBaggage(ctx: Context, baggageId: string): Promise<Baggage> {
        const baggageService = new BaggageService(ctx)
        const baggage = await baggageService.get(baggageId)
        return baggage
    }

    @Transaction(true)
    public async createBaggage(ctx: Context, baggageId: string, owner: string, weight: string, value: string) {
        const baggageService = new BaggageService(ctx)
        await baggageService.create(baggageId, owner, weight, value)
        // events tx 
        const eventData = { baggageId, owner, weight, value}
        ctx.stub.setEvent('BaggageCreated', Buffer.from(JSON.stringify(eventData)))
    }

    @Transaction(true)
    public async updateBaggageOwner(ctx: Context, baggageId: string, newOwner: string) {
        const baggageService = new BaggageService(ctx)
        await baggageService.updateOwner(baggageId, newOwner)
    }

    @Transaction(true)
    public async updateBaggageValue(ctx: Context, baggageId: string, newValue: string) {
        const baggageService = new BaggageService(ctx)
        await baggageService.updateValue(baggageId, newValue)
    }

    @Transaction(true)
    public async updateBaggageWeight(ctx: Context, baggageId: string, newWeight: string) {
        const baggageService = new BaggageService(ctx)
        await baggageService.updateWeight(baggageId, newWeight)
    }

    @Transaction(true)
    public async deleteBaggage(ctx: Context, baggageId: string) {
        const baggageService = new BaggageService(ctx)
        await baggageService.delete(baggageId)
    }

}
