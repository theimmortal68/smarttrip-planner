// ============================================================================
//  src/utils/time.js
//  Helper for formatting Date objects into 12-hour time strings.
// ============================================================================

/**
 * Convert a Date or date-like value to a 12-hour time string (like, "1:00 PM").
 *
 * @param {Date|string|null} date - Date instance or value accepted by Date().
 * @returns {string|null} - Formatted time string or null if input is falsy.
 */
function formatTimeTo12h(date) {
  if (!date) return null;

  const d = date instanceof Date ? date : new Date(date);

  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

module.exports = {
  formatTimeTo12h,
};