import Layout from "./components/Layout.js";

/**
 * CentreAcceptanceEmail — confirmation sent to provider after accepting centre invitation.
 * Ported from 1stepdev.
 */
export default function CentreAcceptanceEmail({
  providerName = "Provider",
  centreName = "Centre",
  centreAddress = "",
  centrePhone = "",
}) {
  const addressLine =
    centreAddress && typeof centreAddress === "object"
      ? [centreAddress.line1, centreAddress.city, centreAddress.state]
          .filter(Boolean)
          .join(", ")
      : centreAddress || "";

  const body = `
    <div style="padding: 32px 40px; background-color: #fff;">
      <h1 style="font-size: 24px; color: #00A08A; font-weight: bold; text-align: center; margin: 0 0 24px;">
        🎉 Welcome Aboard!
      </h1>

      <p style="font-size: 18px; color: #333; font-weight: bold;">
        Hello ${providerName},
      </p>

      <p style="font-size: 15px; color: #333; line-height: 1.6;">
        You have successfully accepted the invitation and joined
        <span style="color: #00A08A; font-weight: bold;">${centreName}</span>!
      </p>

      <div style="background-color: #c3fcf2; color: #00A08A; padding: 15px; border-radius: 8px; text-align: center; font-weight: bold; margin: 20px 0;">
        Your profile is now linked with the centre.
      </div>

      <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #00A08A; margin: 20px 0;">
        <p style="margin: 0 0 10px; font-weight: bold;">📍 Centre Details:</p>
        <p style="margin: 5px 0;"><strong>Name:</strong> ${centreName}</p>
        ${addressLine ? `<p style="margin: 5px 0;"><strong>Address:</strong> ${addressLine}</p>` : ""}
        ${centrePhone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${centrePhone}</p>` : ""}
      </div>

      <p style="font-size: 15px; color: #333;">You can now:</p>
      <p style="margin: 2px 0;">👉 Configure your availability for this centre</p>
      <p style="margin: 2px 0;">👉 Start accepting appointments</p>
      <p style="margin: 2px 0;">👉 Manage your patients through the centre portal</p>
    </div>
  `;

  return Layout({
    previewText: `Welcome to ${centreName}!`,
    children: body,
  });
}
