import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
export const sendMail = async (
  to: string,
  subject: string,
  text: string,
  html: string,
  attachments?: { filename: string; content: any }[],
) => {
  try {
    const res = await resend.emails.send({
      from: "Zaprill <notifications@zaprill.com>",
      to,
      subject,
      html: html,
      text: text,
      attachments: attachments,
    });
    console.log("EMAIL SUCCESS:", res);
  } catch (err) {
    console.error("EMAIL ERROR:", err);
    throw new Error("Failed to send email: " + err);
  }
};
