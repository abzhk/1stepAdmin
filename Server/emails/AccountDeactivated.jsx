import * as React from "react";
import { Text, Section, Link } from "@react-email/components";
import Layout from "./components/Layout.jsx";

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
  supportUrl = "https://1step.com/contact",
}) {
  return (
    <Layout previewText="Important: Your 1Step account has been deactivated">
      {/* Header banner */}
      <Section style={{ backgroundColor: "#2d4a36", padding: "28px 40px" }}>
        <Text style={{ margin: 0, fontSize: "13px", letterSpacing: "2px", color: "#a3c4a8", textTransform: "uppercase", fontWeight: "600" }}>
          Account Notice
        </Text>
        <Text style={{ margin: "8px 0 0", fontSize: "22px", color: "#ffffff", fontWeight: "bold" }}>
          Your Account Has Been Deactivated
        </Text>
      </Section>

      {/* Body */}
      <Section style={{ padding: "32px 40px" }}>
        <Text style={{ fontSize: "16px", color: "#2d4a36", fontWeight: "bold", margin: "0 0 8px" }}>
          Hi {userName},
        </Text>

        <Text style={{ fontSize: "15px", color: "#5b6b60", lineHeight: "1.7", margin: "0 0 20px" }}>
          We are writing to let you know that your 1Step account associated with{" "}
          <span style={{ color: "#2d4a36", fontWeight: "600" }}>{email}</span>{" "}
          has been deactivated by our team on <strong>{deactivatedOn}</strong>.
        </Text>

        {/* Reason box */}
        {reason && (
          <Section style={{
            backgroundColor: "#f8f6f0",
            borderLeft: "4px solid #2d4a36",
            padding: "16px 20px",
            borderRadius: "0 8px 8px 0",
            margin: "0 0 24px",
          }}>
            <Text style={{ margin: "0 0 4px", fontSize: "12px", color: "#9aa69d", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600" }}>
              Reason provided
            </Text>
            <Text style={{ margin: 0, fontSize: "15px", color: "#3a4a3e", lineHeight: "1.6" }}>
              {reason}
            </Text>
          </Section>
        )}

        {/* What this means */}
        <Text style={{ fontSize: "15px", color: "#5b6b60", lineHeight: "1.7", margin: "0 0 16px" }}>
          While your account is deactivated:
        </Text>

        <Section style={{ margin: "0 0 8px" }}>
          <Text style={{ margin: "4px 0", fontSize: "14px", color: "#5b6b60" }}>
            {"✗  You will not be able to sign in to your account"}
          </Text>
          <Text style={{ margin: "4px 0", fontSize: "14px", color: "#5b6b60" }}>
            {"✗  Your bookings and profile will not be visible to others"}
          </Text>
          <Text style={{ margin: "4px 0", fontSize: "14px", color: "#5b6b60" }}>
            {"✓  Your data is safe and securely preserved"}
          </Text>
        </Section>

        {/* Support CTA */}
        <Section style={{ borderTop: "1px solid #e8e4dd", paddingTop: "24px", marginTop: "28px" }}>
          <Text style={{ fontSize: "15px", color: "#5b6b60", lineHeight: "1.7", margin: "0 0 16px" }}>
            If you believe this is a mistake or wish to appeal this decision, please{" "}
            <Link href={supportUrl} style={{ color: "#2d4a36", fontWeight: "600", textDecoration: "underline" }}>
              contact our support team
            </Link>
            {" "}and we will review your case as soon as possible.
          </Text>

          <Text style={{ fontSize: "13px", color: "#9aa69d", lineHeight: "1.6", margin: 0 }}>
            Please reference your registered email address when contacting support so we can locate your account quickly.
          </Text>
        </Section>
      </Section>
    </Layout>
  );
}
