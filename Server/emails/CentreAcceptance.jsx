import * as React from "react";
import { Text, Section } from "@react-email/components";
import Layout from "./components/Layout.jsx";

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

  return (
    <Layout previewText={`Welcome to ${centreName}!`}>
      <Section style={{ padding: "32px 40px", backgroundColor: "#fff" }}>
        <Text style={{ fontSize: "24px", color: "#00A08A", fontWeight: "bold", textAlign: "center", margin: "0 0 24px" }}>
          🎉 Welcome Aboard!
        </Text>

        <Text style={{ fontSize: "18px", color: "#333", fontWeight: "bold" }}>
          Hello {providerName},
        </Text>

        <Text style={{ fontSize: "15px", color: "#333", lineHeight: "1.6" }}>
          You have successfully accepted the invitation and joined{" "}
          <span style={{ color: "#00A08A", fontWeight: "bold" }}>{centreName}</span>!
        </Text>

        <Section style={{ backgroundColor: "#c3fcf2", color: "#00A08A", padding: "15px", borderRadius: "8px", textAlign: "center", fontWeight: "bold", margin: "20px 0" }}>
          Your profile is now linked with the centre.
        </Section>

        <Section style={{ backgroundColor: "#f8f9fa", padding: "15px", borderLeft: "4px solid #00A08A", margin: "20px 0" }}>
          <Text style={{ margin: "0 0 10px", fontWeight: "bold" }}>📍 Centre Details:</Text>
          <Text style={{ margin: "5px 0" }}><strong>Name:</strong> {centreName}</Text>
          {addressLine ? <Text style={{ margin: "5px 0" }}><strong>Address:</strong> {addressLine}</Text> : null}
          {centrePhone ? <Text style={{ margin: "5px 0" }}><strong>Phone:</strong> {centrePhone}</Text> : null}
        </Section>

        <Text style={{ fontSize: "15px", color: "#333" }}>You can now:</Text>
        <Text style={{ margin: "2px 0" }}>👉 Configure your availability for this centre</Text>
        <Text style={{ margin: "2px 0" }}>👉 Start accepting appointments</Text>
        <Text style={{ margin: "2px 0" }}>👉 Manage your patients through the centre portal</Text>
      </Section>
    </Layout>
  );
}
