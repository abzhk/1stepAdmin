import * as React from "react";
import { Text, Section, Button } from "@react-email/components";
import Layout from "./components/Layout.jsx";

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
  clientUrl = "https://1step.com/sign-in",
  reactivatedOn = "",
}) {
  return (
    <Layout previewText="Great news — your 1Step account has been reactivated!">
      {/* Header banner */}
      <Section style={{ backgroundColor: "#2d4a36", padding: "28px 40px" }}>
        <Text style={{ margin: 0, fontSize: "13px", letterSpacing: "2px", color: "#a3c4a8", textTransform: "uppercase", fontWeight: "600" }}>
          Account Update
        </Text>
        <Text style={{ margin: "8px 0 0", fontSize: "22px", color: "#ffffff", fontWeight: "bold" }}>
          Your Account Has Been Reactivated
        </Text>
      </Section>

      {/* Body */}
      <Section style={{ padding: "32px 40px" }}>
        <Text style={{ fontSize: "16px", color: "#2d4a36", fontWeight: "bold", margin: "0 0 8px" }}>
          Welcome back, {userName}!
        </Text>

        <Text style={{ fontSize: "15px", color: "#5b6b60", lineHeight: "1.7", margin: "0 0 20px" }}>
          We are pleased to inform you that your 1Step account associated with{" "}
          <span style={{ color: "#2d4a36", fontWeight: "600" }}>{email}</span>{" "}
          has been successfully reactivated{reactivatedOn ? ` on ${reactivatedOn}` : ""}.
        </Text>

        {/* What is restored */}
        <Section style={{
          backgroundColor: "#f0f7f2",
          borderRadius: "10px",
          padding: "20px 24px",
          margin: "0 0 28px",
          borderLeft: "4px solid #2d4a36",
        }}>
          <Text style={{ margin: "0 0 12px", fontSize: "14px", color: "#2d4a36", fontWeight: "700" }}>
            Your account is fully restored:
          </Text>
          <Text style={{ margin: "4px 0", fontSize: "14px", color: "#5b6b60" }}>
            {"✓  You can now sign in to your account"}
          </Text>
          <Text style={{ margin: "4px 0", fontSize: "14px", color: "#5b6b60" }}>
            {"✓  All your bookings and profile data are intact"}
          </Text>
          <Text style={{ margin: "4px 0", fontSize: "14px", color: "#5b6b60" }}>
            {"✓  Your profile is visible and accessible"}
          </Text>
        </Section>

        {/* Sign in CTA */}
        <Section style={{ textAlign: "center", margin: "28px 0" }}>
          <Button
            href={clientUrl}
            style={{
              backgroundColor: "#2d4a36",
              color: "#fff",
              padding: "14px 32px",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "15px",
              display: "inline-block",
            }}
          >
            Sign In to Your Account
          </Button>
        </Section>

        <Text style={{ fontSize: "13px", color: "#9aa69d", lineHeight: "1.6", margin: 0, textAlign: "center" }}>
          If you experience any issues signing in or have any questions,
          please do not hesitate to contact our support team.
        </Text>
      </Section>
    </Layout>
  );
}
