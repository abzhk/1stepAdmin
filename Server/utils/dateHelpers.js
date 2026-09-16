/**
 * Formats a UTC date to DD/MM/YYYY in the user's local timezone
 * Ensures consistent formatting regardless of the browser's locale.
 * @param {Date|string} utcDate - UTC date from backend
 * @returns {string} Date string in DD/MM/YYYY format (local timezone)
 */
export const formatLocalDateDDMMYYYY = (utcDate) => {
    if (!utcDate) return '';
 
    const date = new Date(utcDate);
    if (isNaN(date.getTime())) return '';
   
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
 
    return `${day}/${month}/${year}`;
};
