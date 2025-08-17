export const formatIDR = (value) => {
  const number = parseInt(value.replace(/\D/g, "") || "0", 10);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

export const parseNumber = (value) => {
  return parseInt(value.replace(/\D/g, "") || "0", 10);
};