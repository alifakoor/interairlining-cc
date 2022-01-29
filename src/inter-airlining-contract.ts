/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Baggage } from './baggage/baggage'

@Info({title: 'InterAirliningContract', description: 'My Smart Contract' })
export class InterAirliningContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async baggageExists(ctx: Context, baggageId: string): Promise<boolean> {
        const data: Uint8Array = await ctx.stub.getState(baggageId);
        return (!!data && data.length > 0);
    }

    @Transaction(false)
    @Returns('Baggage')
    public async getBaggage(ctx: Context, baggageId: string): Promise<Baggage> {
        const baggageBuffer = await ctx.stub.getState(baggageId)
        const baggage: Baggage = JSON.parse(baggageBuffer.toString())

        console.log(`Get Baggage ${baggageId}`, baggage)

        return baggage
    }

    @Transaction(true)
    public async createBaggage(ctx: Context, baggageId: string, owner: string, weight: string, value: string) {
        console.log(`Create New Baggage ${baggageId}`, owner, weight, value)

        if (await this.baggageExists(ctx, baggageId)) {
            throw new Error(`Baggage ${baggageId} already exists`)
        }

        let baggage = new Baggage()
        baggage = {
            owner,
            weight: +weight,
            value: +value
        }

        const baggageBuffer = Buffer.from(JSON.stringify(baggage))

        await ctx.stub.putState(baggageId, baggageBuffer)
    }

    @Transaction(true)
    public async updateBaggageOwner(ctx: Context, baggageId: string, newOwner: string) {
        let baggage = await this.getBaggage(ctx, baggageId)
        baggage.owner = newOwner

        const baggageBuffer = Buffer.from(JSON.stringify(baggage))

        await ctx.stub.putState(baggageId, baggageBuffer)
    }

    @Transaction(true)
    public async updateBaggageValue(ctx: Context, baggageId: string, newValue: string) {
        let baggage = await this.getBaggage(ctx, baggageId)
        baggage.value = +newValue

        const baggageBuffer = Buffer.from(JSON.stringify(baggage))

        await ctx.stub.putState(baggageId, baggageBuffer)
    }

    @Transaction(true)
    public async updateBaggageWeight(ctx: Context, baggageId: string, newWeight: string) {
        let baggage = await this.getBaggage(ctx, baggageId)
        baggage.weight = +newWeight

        const baggageBuffer = Buffer.from(JSON.stringify(baggage))

        await ctx.stub.putState(baggageId, baggageBuffer)
    }

    @Transaction(true)
    public async deleteBaggage(ctx: Context, baggageId: string) {
        await ctx.stub.deleteState(baggageId)
    }

}
