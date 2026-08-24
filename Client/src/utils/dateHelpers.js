/**
 * Timezone-Safe Date Utilities
 * 
 * These utilities handle date conversions between UTC (storage) and local timezone (display)
 * without the common pitfalls of Date.toISOString() which causes timezone shifts.
 * 
 * Best Practices:
 * - Always store dates in UTC in the database
 * - Convert to local timezone only for display
 * - Use these helpers to avoid timezone bugs
 */

/**
 * Formats a UTC date to YYYY-MM-DD in the user's local timezone
 * @param {Date|string} utcDate - UTC date from backend
 * @returns {string} Date string in YYYY-MM-DD format (local timezone)
 */
export const formatLocalDate = (utcDate) => {
    if (!utcDate) return '';

    const date = new Date(utcDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

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

/**
 * Gets the date string from a Date object without timezone conversion
 * Useful when you want to keep the date as-is (e.g., "2026-02-22" stays "2026-02-22")
 * @param {Date} date - Local Date object
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const getLocalDateString = (date) => {
    if (!date) return '';

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

/**
 * Parses a date string (YYYY-MM-DD) as UTC midnight
 * This is useful for backend queries where we want the exact date without timezone shifts
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Date} UTC Date object at midnight
 */
export const parseUTCDate = (dateString) => {
    if (!dateString) return null;

    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
};

/**
 * Converts a local date to UTC while preserving the calendar date
 * Example: "2026-02-22" in IST becomes "2026-02-22T00:00:00.000Z" in UTC
 * This ensures the date appears correctly in both IST and UTC contexts
 * @param {Date|string} localDate - Local date or date string
 * @returns {Date} UTC Date with the same calendar date
 */
export const localDateToUTC = (localDate) => {
    if (!localDate) return null;

    const date = new Date(localDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Create UTC date with the same calendar date
    return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
};

/**
 * Formats a date for display in the local timezone
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale string (default: 'en-IN' for India)
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatLocalDateTime = (date, locale = 'en-IN', options = {}) => {
    if (!date) return '';

    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(new Date(date));
};

/**
 * Checks if a date is today in the local timezone
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
export const isToday = (date) => {
    if (!date) return false;

    const today = new Date();
    const compareDate = new Date(date);

    return today.getFullYear() === compareDate.getFullYear() &&
        today.getMonth() === compareDate.getMonth() &&
        today.getDate() === compareDate.getDate();
};

/**
 * Gets the start and end of day in UTC for a given local date
 * Useful for date range queries
 * @param {Date|string} localDate - Local date
 * @returns {{start: Date, end: Date}} UTC start and end of the day
 */
export const getUTCDayRange = (localDate) => {
    const date = new Date(localDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const start = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

    return { start, end };
};

/**
 * Formats a date for display — supports multiple output formats.
 *
 * Safely parses the input WITHOUT relying on browser-specific Date string parsing.
 * Accepts ISO strings ("2026-02-04"), UTC timestamps, or Date objects.
 *
 * @param {Date|string} date - Date to format (ISO string or Date object)
 * @param {"short"|"numeric"|"long"} type - Output format:
 *   - "short"   → "3-Feb-2026"
 *   - "numeric" → "03/02/2026"
 *   - "long"    → "04 Feb 2026"
 * @returns {string} Formatted date string, or '' if invalid
 *
 * @example
 *   formatDate("2026-02-04", "short")   // "4-Feb-2026"
 *   formatDate("2026-02-04", "numeric") // "04/02/2026"
 *   formatDate("2026-02-04", "long")    // "04 Feb 2026"
 */
export const formatDate = (date, type = "short") => {
    if (!date) return "";

    // Safe parse — use numeric constructor to avoid timezone shifts
    const raw = new Date(date);
    if (isNaN(raw.getTime())) return "";

    const year  = raw.getFullYear();
    const month = raw.getMonth();
    const day   = raw.getDate();

    // Construct from parts — avoids any TZ conversion
    const d = new Date(year, month, day);

    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    if (type === "short") {
        // "3-Feb-2026"
        return `${d.getDate()}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
    }

    if (type === "numeric") {
        // "03/02/2026"  (DD/MM/YYYY)
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        return `${dd}/${mm}/${d.getFullYear()}`;
    }

    if (type === "long") {
        // "04 Feb 2026"
        const dd = String(d.getDate()).padStart(2, "0");
        return `${dd} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    }

    return "";
};

/**
 * Converts a 24-hour time string "15:30" to "3:30 PM"
 */
export const formatTimeAMPM = (timeStr) => {
    if (!timeStr) return "";
    if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
    const parts = timeStr.split(":");
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1].substring(0, 2);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const hStr = hours < 10 ? `0${hours}` : `${hours}`;
    return `${hStr}:${minutes} ${ampm}`;
};

/**
 * Returns a time range "03:30 PM - 04:00 PM"
 * Accepts startTime "15:30" and duration (default 30) or end time.
 */
export const formatTimeRangeAMPM = (startTime, durationMinutesOrEndTime = 30) => {

    console.log("durationMinutesOrEndTime", durationMinutesOrEndTime)
    if (!startTime) return "";
    
    if (typeof durationMinutesOrEndTime === "string") {
        return `${formatTimeAMPM(startTime)} - ${formatTimeAMPM(durationMinutesOrEndTime)}`;
    }
    
    const parts = startTime.split(":");
    if (parts.length < 2) return formatTimeAMPM(startTime);
    
    let startDate = new Date(0, 0, 0, parseInt(parts[0], 10), parseInt(parts[1], 10));
    let endDate = new Date(startDate.getTime() + durationMinutesOrEndTime * 60000);
    
    const formatTime = (d) => {
        let h = d.getHours();
        const m = d.getMinutes().toString().padStart(2, '0');
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12; 
        const hStr = h < 10 ? `0${h}` : `${h}`;
        return `${hStr}:${m} ${ampm}`;
    };
    
    return `${formatTime(startDate)} - ${formatTime(endDate)}`;
};
