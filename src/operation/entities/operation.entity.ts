import { Package } from "../../package/entities/package.entity";

export class Operation {
    name: string;
    value: number;
    billType: number;
    status: string;
    packages: Package[];

    parent?: Operation;
    children?: Operation[];

    userId: number;
}
