export const formatPrice = (
  amount: number,
  {
    currency = "USD",
    currencyDisplay = "symbol",
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping = true,
    notation = "standard",
    signDisplay = "auto",
  }: Intl.NumberFormatOptions = {},
) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay,
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping,
    notation,
    signDisplay,
  });

  return formatter.format(amount);
};
