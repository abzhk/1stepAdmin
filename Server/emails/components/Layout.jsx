import * as React from "react";
import { Html, Head, Body, Container, Section, Text } from "@react-email/components";

/**
 * Shared email layout wrapper — 1Step Admin
 * Mirrors the 1stepdev Layout but uses admin neutral brand tones.
 */
export default function Layout({ children, previewText }) {
  return (
    <Html>
      <Head />
      {previewText && (
        <div style={{ display: "none", maxHeight: 0, overflow: "hidden" }}>
          {previewText}
        </div>
      )}
      <Body style={{ margin: 0, padding: 0, backgroundColor: "#eceae4" }}>
        <Container style={{ margin: "0 auto", padding: "32px 12px", width: "100%", maxWidth: "560px" }}>
          <Section style={{ backgroundColor: "#ffffff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 8px 30px rgba(45,74,54,0.08)" }}>
            {children}

            {/* Footer */}
            <Section style={{ backgroundColor: "#F6F4F0", padding: "24px 40px", borderTop: "1px solid #e8e4dd" }}>
              <Text style={{ margin: 0, fontSize: "12px", lineHeight: "1.6", color: "#9aa69d" }}>
                If you have any questions, please contact our support team.
              </Text>
              <Text style={{ margin: "8px 0 0", fontSize: "12px", color: "#7a877f", fontWeight: "600" }}>
                — The 1Step Support Team
              </Text>
            </Section>
          </Section>

          <Text style={{ maxWidth: "560px", margin: "18px auto 0", fontSize: "11px", color: "#a7aaa3", textAlign: "center" }}>
            &copy; {new Date().getFullYear()} 1Step. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
