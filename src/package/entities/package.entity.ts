import type { OperationBillType, Package, PackageStatus } from "@prisma/client"
import type { PackageEntityProps } from "@/types"
import { MaxBillQuantity } from "@/utils/constants"
import { RandomHexColor, billTypeToNumber } from "@/utils"
import { Max } from "class-validator"

export class PackageEntity implements Package {
  id: number
  createdAt: Date
  updatedAt: Date
  status: PackageStatus

  @Max(MaxBillQuantity)
  billQuantity: number
  billType: OperationBillType

  value: number
  color: string
  grandpaId: string | null
  operationId: string | null

  constructor(props: PackageEntityProps) {
    Object.assign(this, props)
    const { billQuantity, billType } = props
    const billValue = billTypeToNumber(billType)

    this.color = RandomHexColor()
    this.value = this.billQuantity * billValue
    this.status = billQuantity === MaxBillQuantity ? "closed" : "opened"
  }
}
