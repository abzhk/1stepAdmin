/**
 * emails/index.js — Central email render helper for 1stepAdmin
 *
 * Usage:
 *   import { renderEmail } from "../emails/index.js";
 *   import AccountDeactivatedEmail from "../emails/AccountDeactivated.js";
 *
 *   const html = await renderEmail(AccountDeactivatedEmail, { userName, reason, ... });
 */

/**
 * Renders an email template function to an HTML string.
 * @param {Function} Component - The email component function
 * @param {object}   props     - Props to pass to the component
 * @returns {Promise<string>}  - Rendered HTML string
 */
export const renderEmail = async (Component, props = {}) => {
  // Now our templates are simple functions that return HTML strings directly
  const html = Component(props);
  return html;
};
