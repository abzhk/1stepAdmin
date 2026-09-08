import Layout from "./components/Layout.js";

/**
 * CentreInvitationEmail — sent when a centre invites a provider to join.
 * Ported from 1stepdev with same props contract.
 */
export default function CentreInvitationEmail({
  providerName = "Provider",
  centreName = "Centre",
  consultationFee = "0",
  role = "provider",
  message = "",
  acceptUrl = "",
}) {
  const safeRole = role.charAt(0).toUpperCase() + role.slice(1);

  const body = `
    <div style="padding: 32px 40px; background-color: #fff;">
      <h1 style="font-size: 24px; color: #65467C; font-weight: bold; text-align: center; margin: 0 0 24px;">
        🏥 Centre Invitation
      </h1>

      <p style="font-size: 18px; color: #333; font-weight: bold;">
        Hello ${providerName},
      </p>

      <p style="font-size: 15px; color: #333; line-height: 1.6;">
        You have been invited to join
        <span style="color: #65467C; font-weight: bold;">${centreName}</span>
        as a healthcare provider!
      </p>

      ${message ? `
        <p style="font-style: italic; color: #555;">
          "${message}"
        </p>
      ` : ""}

      <div style="background-color: #f8f6fa; border-left: 4px solid #65467C; padding: 15px; margin: 20px 0;">
        <p style="margin: 0 0 10px; font-weight: bold;">📋 Invitation Details:</p>
        <p style="margin: 5px 0;"><strong>Centre:</strong> ${centreName}</p>
        <p style="margin: 5px 0;"><strong>Role:</strong> ${safeRole}</p>
        <p style="margin: 5px 0;"><strong>Consultation Fee:</strong> ₹${consultationFee}</p>
      </div>

      <p style="font-size: 15px; color: #333; margin: 10px 0 5px;">
        By accepting this invitation, you will be able to:
      </p>
      <p style="margin: 2px 0;">✅ Manage appointments at ${centreName}</p>
      <p style="margin: 2px 0;">✅ Access centre resources and facilities</p>
      <p style="margin: 2px 0;">✅ Collaborate with other healthcare providers</p>
      <p style="margin: 2px 0;">✅ Grow your practice with centre support</p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${acceptUrl}" style="background-color: #00C9BA; color: #fff; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
          Accept Invitation
        </a>
      </div>

      <p style="font-size: 14px; color: #666; margin-top: 30px;">
        <strong>⏰ Important:</strong> This invitation will expire in 7 days. Please accept it before it expires.
      </p>

      <p style="font-size: 14px; color: #666;">
        If you are having trouble with the button above, copy and paste this link into your browser:<br />
        <a href="${acceptUrl}" style="word-break: break-all; color: #65467C;">${acceptUrl}</a>
      </p>
    </div>
  `;

  return Layout({
    previewText: `You have been invited to join ${centreName}`,
    children: body,
  });
}
