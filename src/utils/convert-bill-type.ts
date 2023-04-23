import { OperationBillType } from "@prisma/client"

/**
 * Converts the `billType` property from string to number.
 *
 * @export
 * @param {OperationBillType} billType Bill type
 * @return {*}  {(10 | 50 | 100)} Bill value
 */
export function billTypeToNumber(billType: OperationBillType): 10 | 50 | 100 {
  return billType === "hundred"
    ? 100
    : billType === "fifty"
    ? 50
    : billType === "ten"
    ? 10
    : null
}

/**
 * Converts the bill value from number to string.
 *
 * @export
 * @param {number} billValue Bill value
 * @return {OperationBillType} Bill type
 */
export function numberToBillType(billValue: 10 | 50 | 100): OperationBillType {
  return billValue === 100
    ? "hundred"
    : billValue === 50
    ? "fifty"
    : billValue === 10
    ? "ten"
    : null
}

