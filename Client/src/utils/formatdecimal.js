export const formatDecimal = (value, digits = 2) => {
  if (value === null || value === undefined || value === "") return "0.00";

  const number = Number(value);
  if (isNaN(number)) return "0.00";

  return number.toFixed(digits);
};
