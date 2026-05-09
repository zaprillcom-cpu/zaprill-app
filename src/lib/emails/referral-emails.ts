/**
 * referral-emails.ts
 * Sends notification emails when a referral converts.
 *  - Referrer: "Your friend subscribed! Here's your reward coupon."
 *  - Referee:  "Welcome! Your referral discount is inside."
 */

import { eq } from "drizzle-orm";
import db from "@/db";
import { coupons, referralRewards, referrals, user } from "@/db/schema";
import { sendMail } from "./sendMail";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.zaprill.com";

// ─────────────────────────────────────────────────
// Referrer Reward Email
// ─────────────────────────────────────────────────

export async function sendReferrerRewardEmail(
  referrerUserId: string,
  referralId: string,
): Promise<void> {
  // Fetch referrer info
  const [referrerRow] = await db
    .select({ email: user.email, name: user.name })
    .from(user)
    .where(eq(user.id, referrerUserId))
    .limit(1);

  if (!referrerRow?.email) return;

  // Fetch the coupon reward issued to the referrer
  const [rewardRow] = await db
    .select({ couponId: referralRewards.couponId })
    .from(referralRewards)
    .where(eq(referralRewards.referralId, referralId))
    .limit(1);

  let couponCode = "";
  let discountPct = "";
  if (rewardRow?.couponId) {
    const [coupon] = await db
      .select({ code: coupons.code, value: coupons.value })
      .from(coupons)
      .where(eq(coupons.id, rewardRow.couponId))
      .limit(1);
    if (coupon) {
      couponCode = coupon.code;
      discountPct = coupon.value;
    }
  }

  const firstName = (referrerRow.name ?? "there").split(" ")[0];

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your referral reward is here 🎉</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f0f0f 0%,#1a1a2e 100%);padding:36px 40px;">
              <img src="${APP_URL}/logo.png" alt="Zaprill" style="display:block;height:32px;width:auto;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#0f0f0f;">
                🎉 Your friend just subscribed!
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
                Hi ${firstName}, someone you referred has just completed their first subscription on Zaprill.
                As a thank-you, here's your reward coupon:
              </p>

              ${
                couponCode
                  ? `
              <!-- Coupon box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#f8f8fa;border:2px dashed #e0e0e0;border-radius:10px;padding:20px 24px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:1px;">Your Reward Coupon</p>
                    <p style="margin:0 0 6px;font-size:28px;font-weight:800;color:#0f0f0f;letter-spacing:2px;font-family:monospace;">${couponCode}</p>
                    <p style="margin:0;font-size:13px;color:#666;">${discountPct}% off your next renewal</p>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }

              <p style="margin:0 0 28px;font-size:14px;color:#666;line-height:1.6;">
                Apply this coupon at checkout on your next subscription renewal. It expires in 12 months.
              </p>

              <a href="${APP_URL}/billing" style="display:inline-block;background:linear-gradient(135deg,#0f0f0f,#1a1a2e);color:#fff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;">
                Go to Billing →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f8fa;padding:18px 40px;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:11px;color:#aaa;text-align:center;">
                © ${new Date().getFullYear()} Zaprill. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = [
    `Hi ${firstName},`,
    ``,
    `Someone you referred has subscribed to Zaprill! 🎉`,
    ...(couponCode
      ? [
          ``,
          `Your reward coupon: ${couponCode}`,
          `Discount: ${discountPct}% off your next renewal`,
        ]
      : []),
    ``,
    `Redeem it at: ${APP_URL}/billing`,
    ``,
    `© ${new Date().getFullYear()} Zaprill`,
  ].join("\n");

  await sendMail(
    referrerRow.email,
    "🎉 Your referral earned you a reward!",
    text,
    html,
  );
}

// ─────────────────────────────────────────────────
// Referee Welcome Email
// ─────────────────────────────────────────────────

export async function sendRefereeWelcomeEmail(
  refereeUserId: string,
  referralId: string,
): Promise<void> {
  const [refereeRow] = await db
    .select({ email: user.email, name: user.name })
    .from(user)
    .where(eq(user.id, refereeUserId))
    .limit(1);

  if (!refereeRow?.email) return;

  // Fetch the referee coupon reward
  const [rewardRow] = await db
    .select({ couponId: referralRewards.couponId })
    .from(referralRewards)
    .where(eq(referralRewards.referralId, referralId))
    .limit(1);

  let couponCode = "";
  let discountPct = "";
  if (rewardRow?.couponId) {
    const [coupon] = await db
      .select({ code: coupons.code, value: coupons.value })
      .from(coupons)
      .where(eq(coupons.id, rewardRow.couponId))
      .limit(1);
    if (coupon) {
      couponCode = coupon.code;
      discountPct = coupon.value;
    }
  }

  const firstName = (refereeRow.name ?? "there").split(" ")[0];

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Zaprill — your discount is inside</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f0f0f 0%,#1a1a2e 100%);padding:36px 40px;">
              <img src="${APP_URL}/logo.png" alt="Zaprill" style="display:block;height:32px;width:auto;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#0f0f0f;">
                Welcome to Zaprill, ${firstName}! 🚀
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
                Thanks for joining through a friend's referral. As a welcome gift, here's a discount coupon you can use on your upcoming renewals:
              </p>

              ${
                couponCode
                  ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#f8f8fa;border:2px dashed #e0e0e0;border-radius:10px;padding:20px 24px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:1px;">Your Welcome Coupon</p>
                    <p style="margin:0 0 6px;font-size:28px;font-weight:800;color:#0f0f0f;letter-spacing:2px;font-family:monospace;">${couponCode}</p>
                    <p style="margin:0;font-size:13px;color:#666;">${discountPct}% off your next subscription</p>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }

              <p style="margin:0 0 28px;font-size:14px;color:#666;line-height:1.6;">
                Apply it at checkout. Valid for 6 months.
              </p>

              <a href="${APP_URL}/billing" style="display:inline-block;background:linear-gradient(135deg,#0f0f0f,#1a1a2e);color:#fff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;">
                View Subscription →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f8fa;padding:18px 40px;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:11px;color:#aaa;text-align:center;">
                © ${new Date().getFullYear()} Zaprill. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = [
    `Welcome to Zaprill, ${firstName}!`,
    ``,
    `Thanks for joining through a friend's referral.`,
    ...(couponCode
      ? [
          ``,
          `Your welcome coupon: ${couponCode}`,
          `Discount: ${discountPct}% off your next subscription`,
        ]
      : []),
    ``,
    `Use it at checkout: ${APP_URL}/billing`,
    ``,
    `© ${new Date().getFullYear()} Zaprill`,
  ].join("\n");

  await sendMail(
    refereeRow.email,
    "🎁 Your referral welcome gift — use it now",
    text,
    html,
  );
}
