/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Baggage } from './baggage/baggage'
import { BaggageService } from './baggage/baggage.service';

@Info({title: 'InterAirliningContract', description: 'My Smart Contract' })
export class InterAirliningContract extends Contract {

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
