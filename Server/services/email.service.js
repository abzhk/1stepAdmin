/**
 * services/email.service.js
 *
 * Production email service for 1stepAdmin — powered by Resend.
 * Replaces the old nodemailer + Gmail setup.
 *
 * Required env vars (same key as 1stepdev):
 *   RESEND_API_KEY   — Resend API key
 *   EMAIL_FROM       — Verified sender e.g. "1Step <no-reply@1step.com>"
 *   CLIENT_URL       — 1stepdev frontend URL e.g. "https://app.1step.com"
 *   SUPPORT_URL      — Support/contact page URL
 */

import { Resend } from "resend";
import { renderEmail } from "../emails/index.js";

// ── Email templates ────────────────────────────────────────────
import AccountDeactivatedEmail from "../emails/AccountDeactivated.js";
import AccountReactivatedEmail from "../emails/AccountReactivated.js";
import CentreInvitationEmail   from "../emails/CentreInvitation.js";
import CentreAcceptanceEmail   from "../emails/CentreAcceptance.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM    = process.env.EMAIL_FROM    || "1Step <no-reply@1step.com>";
const SUPPORT = process.env.SUPPORT_URL   || "https://1step.space/contact";
const CLIENT  = process.env.CLIENT_URL    || "https://1step.space/auth/signin";

// ─── Core send ─────────────────────────────────────────────────────────────────

/**
 * Low-level Resend send wrapper.
 * Never throws — logs and returns null on failure so it never blocks business logic.
 *
 * @param {{ to: string, subject: string, html: string, from?: string }} opts
 * @returns {Promise<object|null>}
 */
export const sendEmail = async ({ to, subject, html, from = FROM }) => {
  try {
    const result = await resend.emails.send({ from, to, subject, html });
    return result;
  } catch (err) {
    console.error("[EmailService] Failed to send email:", err?.message || err);
    return null;
  }
};

// ─── Domain helpers ────────────────────────────────────────────────────────────

/**
 * Send account deactivation notice to user.
 * Always sent when admin deactivates an account.
 *
 * @param {{ user: object, reason: string, adminName?: string }} opts
 */
export const sendAccountDeactivatedEmail = async ({ user, reason }) => {
  try {
    const deactivatedOn = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const html = await renderEmail(AccountDeactivatedEmail, {
      userName:       user.username || "User",
      email:          user.email,
      reason:         reason || "No specific reason was provided.",
      deactivatedOn,
      supportUrl:     SUPPORT,
    });

    return sendEmail({
      to:      user.email,
      subject: "Your 1Step account has been deactivated",
      html,
    });
  } catch (err) {
    console.error("[EmailService] sendAccountDeactivatedEmail error:", err?.message);
    return null;
  }
};

/**
 * Send account reactivation confirmation to user.
 * Only sent if admin explicitly selects "Send reactivation email" in the dashboard.
 *
 * @param {{ user: object }} opts
 */
export const sendAccountReactivatedEmail = async ({ user }) => {
  try {
    const reactivatedOn = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const html = await renderEmail(AccountReactivatedEmail, {
      userName:      user.username || "User",
      email:         user.email,
      clientUrl:     CLIENT,
      reactivatedOn,
    });

    return sendEmail({
      to:      user.email,
      subject: "Your 1Step account has been reactivated",
      html,
    });
  } catch (err) {
    console.error("[EmailService] sendAccountReactivatedEmail error:", err?.message);
    return null;
  }
};

/**
 * Send centre invitation email to a provider.
 * Replaces the raw nodemailer HTML in centre.controller.js.
 *
 * @param {{ to, providerName, centreName, consultationFee, role, message, acceptUrl }} opts
 */
export const sendCentreInvitationEmail = async ({
  to,
  providerName,
  centreName,
  consultationFee,
  role,
  message,
  acceptUrl,
}) => {
  try {
    const html = await renderEmail(CentreInvitationEmail, {
      providerName,
      centreName,
      consultationFee,
      role,
      message,
      acceptUrl,
    });

    return sendEmail({
      to,
      subject: `You have been invited to join ${centreName} on 1Step`,
      html,
    });
  } catch (err) {
    console.error("[EmailService] sendCentreInvitationEmail error:", err?.message);
    return null;
  }
};

/**
 * Send centre acceptance confirmation email to the provider.
 * Replaces raw nodemailer in centre.controller.js accept flow.
 *
 * @param {{ to, providerName, centreName, centreAddress, centrePhone }} opts
 */
export const sendCentreAcceptanceEmail = async ({
  to,
  providerName,
  centreName,
  centreAddress,
  centrePhone,
}) => {
  try {
    const html = await renderEmail(CentreAcceptanceEmail, {
      providerName,
      centreName,
      centreAddress,
      centrePhone,
    });

    return sendEmail({
      to,
      subject: `Welcome to ${centreName} — You are now part of the team!`,
      html,
    });
  } catch (err) {
    console.error("[EmailService] sendCentreAcceptanceEmail error:", err?.message);
    return null;
  }
};

/**
 * Send plain HTML email (used for OTP password reset in auth.controller.js).
 * Drop-in replacement for the old nodemailer sendEmail() internal function.
 *
 * @param {{ to: string, subject: string, html: string }} opts
 */
export const sendPlainEmail = async ({ to, subject, html }) => {
  return sendEmail({ to, subject, html });
};
