export const formatIDR = (value: number | string) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value));
};

export const formatPercent = (value: number | string) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(Number(value) / 100);
};

export const formatNumber = (value: number | string) => {
  return new Intl.NumberFormat('id-ID').format(Number(value));
};

export const formatCompactIDR = (value: number | string) => {
  const num = Number(value);

  if (num < 1000000) {
    return formatIDR(num);
  }

  if (num < 1000000000) {
    return `Rp ${(num / 1000000).toFixed(1).replace(/\.0$/, '')} Juta`;
  }

  if (num < 1000000000000) {
    return `Rp ${(num / 1000000000).toFixed(1).replace(/\.0$/, '')} Milyar`;
  }

  return `Rp ${(num / 1000000000000).toFixed(1).replace(/\.0$/, '')} Triliun`;
};
