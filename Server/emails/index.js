/**
 * emails/index.js — Central email render helper for 1stepAdmin
 *
 * Usage:
 *   import { renderEmail } from "../emails/index.js";
 *   import AccountDeactivatedEmail from "../emails/AccountDeactivated.jsx";
 *
 *   const html = await renderEmail(AccountDeactivatedEmail, { userName, reason, ... });
 */

import { render } from "@react-email/render";

/**
 * Renders a React Email JSX component to an HTML string.
 * @param {Function} Component - The JSX email component
 * @param {object}   props     - Props to pass to the component
 * @returns {Promise<string>}  - Rendered HTML string
 */
export const renderEmail = async (Component, props = {}) => {
  // @react-email/render returns a string (sync or async depending on version)
  const html = await render(Component(props));
  return html;
};
