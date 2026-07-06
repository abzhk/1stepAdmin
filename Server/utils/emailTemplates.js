
const PRIORITY_COLORS = {
  Low: { bg: "#8fa797", soft: "#eef2ef" },
  Medium: { bg: "#d9a400", soft: "#fbf3d6" },
  High: { bg: "#e07a5f", soft: "#fbe9e3" },
};

const STATUS_COLORS = {
  Open: "#2d4a36",
  "In progress": "#d9a400",
  Resolved: "#8fa797",
};

export const ticketReplyEmail = (ticket, replyMessage) => {
  const subject = `Reply for ${ticket.ticketId}`;

  const text =
    `Hi,\n\n` +
    `Our support team has replied to your ticket.\n\n` +
    `Ticket ID: ${ticket.ticketId}\n` +
    `Reply:\n${replyMessage}\n\n` +
    `— 1Step Support`;

  const priority = PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.Medium;
  const statusColor = STATUS_COLORS[ticket.status] || "#2d4a36";

  const row = (label, value) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e8e4dd;font-size:13px;color:#7a877f;font-weight:600;width:120px;">
        ${label}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #e8e4dd;font-size:14px;color:#2d4a36;font-weight:600;">
        ${value}
      </td>
    </tr>`;

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${subject}</title>
</head>

<body style="margin:0;padding:0;background:#eceae4;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px;">
<tr>
<td align="center">

<table width="100%" cellpadding="0" cellspacing="0"
style="max-width:560px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(45,74,54,.08);">

<tr>
<td style="background:#2d4a36;padding:36px 40px;">

<div style="font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#8fa797;">
1Step Support
</div>

<div style="padding-top:14px;font-size:22px;font-weight:700;color:#fff;">
Support Team Reply
</div>

</td>
</tr>

<tr>
<td style="padding:32px 40px;">

<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#5b6b60;">
Our support team has responded to your support request.
</p>

<div style="background:#f3f6f4;border-left:4px solid #8fa797;border-radius:10px;padding:18px;margin-bottom:24px;">

<div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#7a877f;margin-bottom:10px;">
Support Reply
</div>

<div style="font-size:15px;color:#2d4a36;line-height:1.7;white-space:pre-wrap;">
${replyMessage}
</div>

</div>

<table width="100%" cellpadding="0" cellspacing="0">

${row("Ticket ID", ticket.ticketId)}
${row("Category", ticket.category)}

${row(
  "Priority",
  `<span style="display:inline-block;background:${priority.soft};color:${priority.bg};padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;">
    ${ticket.priority}
  </span>`
)}

<tr>
  <td style="
    padding:16px 0;
    border-bottom:1px solid #e8e4dd;
    vertical-align:top;
    font-size:13px;
    color:#7a877f;
    font-weight:600;
    width:120px;">
    Description
  </td>

  <td style="
    padding:16px 0;
    border-bottom:1px solid #e8e4dd;
    font-size:14px;
    color:#2d4a36;
    line-height:1.8;
    white-space:pre-wrap;
    word-break:break-word;">
    ${ticket.description || "-"}
  </td>
</tr>

<tr>
<td style="padding:12px 0;font-size:13px;color:#7a877f;font-weight:600;">
Status
</td>

<td style="padding:12px 0;">
<span style="display:inline-block;background:#f0efe9;color:${statusColor};padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;">
${ticket.status}
</span>
</td>
</tr>

</table>

</td>
</tr>

<tr>
<td style="background:#F6F4F0;padding:24px 40px;border-top:1px solid #e8e4dd;">

<p style="margin:0;font-size:12px;color:#9aa69d;">
If you need additional assistance, simply reply through the support portal.
</p>

<p style="margin-top:8px;font-size:12px;font-weight:600;color:#7a877f;">
— The 1Step Support Team
</p>

</td>
</tr>

</table>

<p style="margin:18px auto 0;font-size:11px;color:#a7aaa3;text-align:center;">
© ${new Date().getFullYear()} 1Step. All rights reserved.
</p>

</td>
</tr>
</table>

</body>
</html>
`;

  return { subject, text, html };
};