// export class Airport {
// 	public name: string
// 	public location: string

// 	constructor(name: string, location: string) {
// 		this.name = name
// 		this.location = location
// 	}
// }

import { Object, Property } from 'fabric-contract-api';

@Object()
export class Airport {
    @Property()
    public name: string;
    public location: string;
}