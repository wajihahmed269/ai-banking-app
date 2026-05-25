export const formatUSD = (amount) => Number(amount || 0).toLocaleString('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const parseMoneyValue = (value) => {
  const amount = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(amount) ? amount : null;
};

export const formatMoney = (amount) => {
  const numericAmount = Number(amount || 0);
  const absolute = Math.abs(numericAmount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${numericAmount < 0 ? '-' : '+'}$${absolute}`;
};
