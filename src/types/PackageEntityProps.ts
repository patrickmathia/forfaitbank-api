import { OperationBillType } from "@prisma/client"

export interface PackageEntityProps {
  billType: OperationBillType
  billQuantity: number
  operationId?: string
  grandpaId?: string
}
