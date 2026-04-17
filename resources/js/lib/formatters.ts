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
