/**
 * Formats a date into a clean professional display string.
 * e.g., "15 July 2026"
 */
export const formatDateDisplay = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Formats date into standard YYYY-MM-DD for HTML date inputs.
 */
export const formatDateForInput = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

/**
 * Formats date and time for document history.
 * e.g., "Nov 22, 2026 at 02:30 PM"
 */
export const formatDateTimeDisplay = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Returns today's date in YYYY-MM-DD
 */
export const getTodayInputString = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Calculates end date by adding months to start date
 */
export const calculateEndDate = (startDateString, durationString) => {
  if (!startDateString) return '';
  const date = new Date(startDateString);
  if (isNaN(date.getTime())) return '';

  const monthsMap = {
    '1 Month': 1,
    '2 Months': 2,
    '3 Months': 3,
    '6 Months': 6
  };

  const monthsToAdd = monthsMap[durationString];
  if (monthsToAdd) {
    date.setMonth(date.getMonth() + monthsToAdd);
    // Adjust by -1 day so a 1-month internship starting July 1 ends July 31
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  }

  return '';
};
