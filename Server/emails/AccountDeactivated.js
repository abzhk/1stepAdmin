import Layout from "./components/Layout.js";

/**
 * AccountDeactivatedEmail — sent by admin when deactivating any user account.
 *
 * Props:
 *  - userName        : Display name of the deactivated user
 *  - email           : User's email (shown for their reference)
 *  - reason          : Reason entered by admin (required)
 *  - deactivatedOn   : Formatted date string e.g. "7 Sep 2026"
 *  - supportUrl      : Link to support/contact page
 */
export default function AccountDeactivatedEmail({
  userName = "User",
  email = "",
  reason = "",
  deactivatedOn = "",
  supportUrl = "https://1step.space/contact",
}) {
  const body = `
    <!-- Header banner -->
    <div style="background-color: #2d4a36; padding: 28px 40px;">
      <p style="margin: 0; font-size: 13px; letter-spacing: 2px; color: #a3c4a8; text-transform: uppercase; font-weight: 600;">
        Account Notice
      </p>
      <h1 style="margin: 8px 0 0; font-size: 22px; color: #ffffff; font-weight: bold;">
        Your Account Has Been Deactivated
      </h1>
    </div>

    <!-- Body -->
    <div style="padding: 32px 40px;">
      <p style="font-size: 16px; color: #2d4a36; font-weight: bold; margin: 0 0 8px;">
        Hi ${userName},
      </p>

      <p style="font-size: 15px; color: #5b6b60; line-height: 1.7; margin: 0 0 20px;">
        We are writing to let you know that your 1Step account associated with
        <span style="color: #2d4a36; font-weight: 600;">${email}</span>
        has been deactivated by our team on <strong>${deactivatedOn}</strong>.
      </p>

      <!-- Reason box -->
      ${reason ? `
        <div style="background-color: #f8f6f0; border-left: 4px solid #2d4a36; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 0 0 24px;">
          <p style="margin: 0 0 4px; font-size: 12px; color: #9aa69d; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
            Reason provided
          </p>
          <p style="margin: 0; font-size: 15px; color: #3a4a3e; line-height: 1.6;">
            ${reason}
          </p>
        </div>
      ` : ""}

      <!-- What this means -->
      <p style="font-size: 15px; color: #5b6b60; line-height: 1.7; margin: 0 0 16px;">
        While your account is deactivated:
      </p>

      <div style="margin: 0 0 8px;">
        <p style="margin: 4px 0; font-size: 14px; color: #5b6b60;">
          ✗  You will not be able to sign in to your account
        </p>
        <p style="margin: 4px 0; font-size: 14px; color: #5b6b60;">
          ✗  Your bookings and profile will not be visible to others
        </p>
        <p style="margin: 4px 0; font-size: 14px; color: #5b6b60;">
          ✓  Your data is safe and securely preserved
        </p>
      </div>

      <!-- Support CTA -->
      <div style="border-top: 1px solid #e8e4dd; padding-top: 24px; margin-top: 28px;">
        <p style="font-size: 15px; color: #5b6b60; line-height: 1.7; margin: 0 0 16px;">
          If you believe this is a mistake or wish to appeal this decision, please
          <a href="${supportUrl}" style="color: #2d4a36; font-weight: 600; text-decoration: underline;">
            contact our support team
          </a>
          and we will review your case as soon as possible.
        </p>

        <p style="font-size: 13px; color: #9aa69d; line-height: 1.6; margin: 0;">
          Please reference your registered email address when contacting support so we can locate your account quickly.
        </p>
      </div>
    </div>
  `;

  return Layout({
    previewText: "Important: Your 1Step account has been deactivated",
    children: body,
  });
}
