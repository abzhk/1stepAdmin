/**
 * Shared email layout wrapper — 1Step Admin
 * Mirrors the 1stepdev Layout but uses admin neutral brand tones.
 */
export default function Layout({ children, previewText = "" }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin: 0; padding: 0; background-color: #eceae4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        ${previewText ? `<div style="display: none; max-height: 0; overflow: hidden;">${previewText}</div>` : ""}
        <div style="margin: 0 auto; padding: 32px 12px; width: 100%; max-width: 560px;">
          <div style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 30px rgba(45,74,54,0.08);">
            ${children}

            <!-- Footer -->
            <div style="background-color: #F6F4F0; padding: 24px 40px; border-top: 1px solid #e8e4dd;">
              <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #9aa69d;">
                If you have any questions, please contact our support team.
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #7a877f; font-weight: 600;">
                — The 1Step Support Team
              </p>
            </div>
          </div>

          <p style="max-width: 560px; margin: 18px auto 0; font-size: 11px; color: #a7aaa3; text-align: center;">
            &copy; ${new Date().getFullYear()} 1Step. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;
}
