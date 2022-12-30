import { Package } from "../../package/entities/package.entity";

export class Operation {
    id: number;
    name: string;
    value: number;
    billType: number;
    status?: string;
    packages: Package[];
    
    parent?: Operation;
    children?: { name: string; status: string; subId: number; }[];
    
    parentOperationId?: number;
    subId?: number;
    userId: number;
}
