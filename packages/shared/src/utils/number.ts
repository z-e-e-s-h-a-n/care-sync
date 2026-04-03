type FormatNumberOptions = Intl.NumberFormatOptions & {
  locale?: string;
  fallback?: string;
};

const DEFAULT_FALLBACK = "-";

export const formatNumber = (
  value?: number,
  options?: FormatNumberOptions,
): string => {
  const {
    locale = "en-US",
    fallback = DEFAULT_FALLBACK,
    ...intlOptions
  } = options || {};

  if (value === null || value === undefined || Number.isNaN(value)) {
    return fallback;
  }

  try {
    return new Intl.NumberFormat(locale, intlOptions).format(value);
  } catch {
    return fallback;
  }
};

type FormatPriceOptions = Omit<FormatNumberOptions, "style"> & {
  currency?: string;
};

export const formatPrice = (
  amount?: number,
  options?: FormatPriceOptions,
): string => {
  const { currency = "USD", ...rest } = options || {};

  return formatNumber(amount, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    ...rest,
  });
};

export const formatPricePrecise = (
  amount?: number,
  options?: FormatPriceOptions,
): string => {
  const { currency = "USD", ...rest } = options || {};

  return formatNumber(amount, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...rest,
  });
};

export const formatCompactNumber = (
  value?: number,
  options?: FormatNumberOptions,
): string => {
  return formatNumber(value, {
    notation: "compact",
    maximumFractionDigits: 1,
    ...options,
  });
};
