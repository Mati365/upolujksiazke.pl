export function getDiscountPercentage(
  prevPrice: number,
  currentPrice: number,
  normalized: boolean = false,
) {
  if (!prevPrice || !currentPrice)
    return null;

  return ((prevPrice - currentPrice) / prevPrice) * (normalized ? 1 : 100);
}
