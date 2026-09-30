export function formatAmount(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function formatRate(value: number): string {
  return value.toLocaleString(undefined, {
    style: "percent",
    maximumFractionDigits: 1,
  });
}

// Short forms for large counts, like 2.4K or 1.3M.
export function formatCount(value: number): string {
  return value.toLocaleString(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  });
}

// A per-tick total with its rate, like "117 (2.7%)".
export function formatTotalAndRate(rate: number, size: number): string {
  return `${formatCount(rate * size)} (${formatRate(rate)})`;
}

export function formatFraction(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
}
