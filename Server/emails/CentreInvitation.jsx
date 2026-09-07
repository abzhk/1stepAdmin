import * as React from "react";
import { Text, Section, Button, Link } from "@react-email/components";
import Layout from "./components/Layout.jsx";

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

  return (
    <Layout previewText={`You have been invited to join ${centreName}`}>
      <Section style={{ padding: "32px 40px", backgroundColor: "#fff" }}>
        <Text style={{ fontSize: "24px", color: "#65467C", fontWeight: "bold", textAlign: "center", margin: "0 0 24px" }}>
          🏥 Centre Invitation
        </Text>

        <Text style={{ fontSize: "18px", color: "#333", fontWeight: "bold" }}>
          Hello {providerName},
        </Text>

        <Text style={{ fontSize: "15px", color: "#333", lineHeight: "1.6" }}>
          You have been invited to join{" "}
          <span style={{ color: "#65467C", fontWeight: "bold" }}>{centreName}</span>{" "}
          as a healthcare provider!
        </Text>

        {message && (
          <Text style={{ fontStyle: "italic", color: "#555" }}>
            "{message}"
          </Text>
        )}

        <Section style={{ backgroundColor: "#f8f6fa", borderLeft: "4px solid #65467C", padding: "15px", margin: "20px 0" }}>
          <Text style={{ margin: "0 0 10px", fontWeight: "bold" }}>📋 Invitation Details:</Text>
          <Text style={{ margin: "5px 0" }}><strong>Centre:</strong> {centreName}</Text>
          <Text style={{ margin: "5px 0" }}><strong>Role:</strong> {safeRole}</Text>
          <Text style={{ margin: "5px 0" }}><strong>Consultation Fee:</strong> ₹{consultationFee}</Text>
        </Section>

        <Text style={{ fontSize: "15px", color: "#333", margin: "10px 0 5px" }}>
          By accepting this invitation, you will be able to:
        </Text>
        <Text style={{ margin: "2px 0" }}>✅ Manage appointments at {centreName}</Text>
        <Text style={{ margin: "2px 0" }}>✅ Access centre resources and facilities</Text>
        <Text style={{ margin: "2px 0" }}>✅ Collaborate with other healthcare providers</Text>
        <Text style={{ margin: "2px 0" }}>✅ Grow your practice with centre support</Text>

        <Section style={{ textAlign: "center", margin: "32px 0" }}>
          <Button
            href={acceptUrl}
            style={{ backgroundColor: "#00C9BA", color: "#fff", padding: "15px 40px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", display: "inline-block" }}
          >
            Accept Invitation
          </Button>
        </Section>

        <Text style={{ fontSize: "14px", color: "#666", marginTop: "30px" }}>
          <strong>⏰ Important:</strong> This invitation will expire in 7 days. Please accept it before it expires.
        </Text>

        <Text style={{ fontSize: "14px", color: "#666" }}>
          If you are having trouble with the button above, copy and paste this link into your browser:
          <br />
          <Link href={acceptUrl} style={{ wordBreak: "break-all", color: "#65467C" }}>{acceptUrl}</Link>
        </Text>
      </Section>
    </Layout>
  );
}
