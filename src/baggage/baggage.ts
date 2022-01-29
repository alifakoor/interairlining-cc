/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class Baggage {

    @Property()
    public owner: string
    public weight: number
    public value: number

}
