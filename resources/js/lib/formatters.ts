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

export const terbilang = (angka: number): string => {
  const bilne = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];

  if (angka < 12) {
    return bilne[angka];
  }

  if (angka < 20) {
    return terbilang(angka - 10) + ' Belas';
  }

  if (angka < 100) {
    return (
      terbilang(Math.floor(angka / 10)) +
      ' Puluh ' +
      (angka % 10 ? terbilang(angka % 10) : '')
    );
  }

  if (angka < 200) {
    return 'Seratus ' + terbilang(angka - 100);
  }

  if (angka < 1000) {
    return (
      terbilang(Math.floor(angka / 100)) +
      ' Ratus ' +
      (angka % 100 ? terbilang(angka % 100) : '')
    );
  }

  if (angka < 2000) {
    return 'Seribu ' + terbilang(angka - 1000);
  }

  if (angka < 1000000) {
    return (
      terbilang(Math.floor(angka / 1000)) +
      ' Ribu ' +
      (angka % 1000 ? terbilang(angka % 1000) : '')
    );
  }

  if (angka < 1000000000) {
    return (
      terbilang(Math.floor(angka / 1000000)) +
      ' Juta ' +
      (angka % 1000000 ? terbilang(angka % 1000000) : '')
    );
  }

  if (angka < 1000000000000) {
    return (
      terbilang(Math.floor(angka / 1000000000)) +
      ' Miliar ' +
      (angka % 1000000000 ? terbilang(angka % 1000000000) : '')
    );
  }

  return '';
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFormattedCost = (price: string | number) => {
  const num = Math.floor(parseFloat(price.toString()) || 0);

  if (num === 0) {
    return '';
  }

  return `${formatIDR(num)} (${terbilang(num)} Rupiah)`;
};
