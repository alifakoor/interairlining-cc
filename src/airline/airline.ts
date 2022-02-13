// export class Airline {
//     public name: string;
//     public country: string;

//     constructor(name: string, country: string) {
//         this.name = name;
//         this.country = country;
//     }
// }

import { Object, Property } from 'fabric-contract-api';

@Object()
export class Airline {
    @Property()
    public name: string;
    public country: string;
}