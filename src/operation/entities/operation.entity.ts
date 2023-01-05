import { IsIn } from "class-validator";
import { Package } from "../../package/entities/package.entity";

export class Operation {
    id: number;
    createdAt: Date;
    updatedAt: Date;

    name: string;
    value: number;
    billType: number;

    @IsIn(["opened", "reserved", "concluded"])
    status: string;
    packages: Package[];
    
    parent?: Operation;
    children?: Partial<Operation>[];
    
    parentOperationId?: number;
    subId?: number;
    userId: number;
}
