export function formatPrice(value: number): string {
  const rounded = Math.round(value);
  return "$" + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}