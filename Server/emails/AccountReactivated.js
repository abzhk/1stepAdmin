import Layout from "./components/Layout.js";

/**
 * AccountReactivatedEmail — sent by admin when reactivating a deactivated account.
 * Admin can choose to send or not send this email from the dashboard.
 *
 * Props:
 *  - userName    : Display name of the user
 *  - email       : User's email
 *  - clientUrl   : URL for the user to sign in (1stepdev client URL)
 *  - reactivatedOn : Formatted date string
 */
export default function AccountReactivatedEmail({
  userName = "User",
  email = "",
  clientUrl = "https://1step.space/sign-in",
  reactivatedOn = "",
}) {
  const body = `
    <!-- Header banner -->
    <div style="background-color: #2d4a36; padding: 28px 40px;">
      <p style="margin: 0; font-size: 13px; letter-spacing: 2px; color: #a3c4a8; text-transform: uppercase; font-weight: 600;">
        Account Update
      </p>
      <h1 style="margin: 8px 0 0; font-size: 22px; color: #ffffff; font-weight: bold;">
        Your Account Has Been Reactivated
      </h1>
    </div>

    <!-- Body -->
    <div style="padding: 32px 40px;">
      <p style="font-size: 16px; color: #2d4a36; font-weight: bold; margin: 0 0 8px;">
        Welcome back, ${userName}!
      </p>

      <p style="font-size: 15px; color: #5b6b60; line-height: 1.7; margin: 0 0 20px;">
        We are pleased to inform you that your 1Step account associated with
        <span style="color: #2d4a36; font-weight: 600;">${email}</span>
        has been successfully reactivated${reactivatedOn ? ` on ${reactivatedOn}` : ""}.
      </p>

      <!-- What is restored -->
      <div style="background-color: #f0f7f2; border-radius: 10px; padding: 20px 24px; margin: 0 0 28px; border-left: 4px solid #2d4a36;">
        <p style="margin: 0 0 12px; font-size: 14px; color: #2d4a36; font-weight: 700;">
          Your account is fully restored:
        </p>
        <p style="margin: 4px 0; font-size: 14px; color: #5b6b60;">
          ✓  You can now sign in to your account
        </p>
        <p style="margin: 4px 0; font-size: 14px; color: #5b6b60;">
          ✓  All your bookings and profile data are intact
        </p>
        <p style="margin: 4px 0; font-size: 14px; color: #5b6b60;">
          ✓  Your profile is visible and accessible
        </p>
      </div>

      <!-- Sign in CTA -->
      <div style="text-align: center; margin: 28px 0;">
        <a href="${clientUrl}" style="background-color: #2d4a36; color: #fff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
          Sign In to Your Account
        </a>
      </div>

      <p style="font-size: 13px; color: #9aa69d; line-height: 1.6; margin: 0; text-align: center;">
        If you experience any issues signing in or have any questions,
        please do not hesitate to contact our support team.
      </p>
    </div>
  `;

  return Layout({
    previewText: "Great news — your 1Step account has been reactivated!",
    children: body,
  });
}
