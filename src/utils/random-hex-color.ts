/**
 * Returns a random 6 digits hex color.
 *
 * @export
 * @return {*}  {string} Hex Color
 */
export function RandomHexColor(): string {
  const n = (Math.random() * 0xfffff * 1000000).toString(16)
  return "#" + n.slice(0, 6)
}
