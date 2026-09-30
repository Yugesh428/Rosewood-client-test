/**
 * Email template for email verification
 */
export function verificationEmailTemplate(params: {
  name: string;
  verificationCode: string;
  expiryMinutes?: number;
}): { subject: string; html: string; text: string } {
  const { name, verificationCode, expiryMinutes = 15 } = params;

  const subject = "Verify Your Email - Rosewood Pharmacy";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F5F3EF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F5F3EF;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #FFFFFF; border: 1px solid #E5E5E5;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #E5E5E5;">
              <div style="font-size: 11px; letter-spacing: 0.35em; text-transform: uppercase; color: #D4AF37; margin-bottom: 12px;">
                Rosewood Pharmacy
              </div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 400; color: #1A1A1A; line-height: 1.3;">
                Verify Your Email
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #1A1A1A;">
                Hello <strong>${name}</strong>,
              </p>
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #6B6B6B;">
                Thank you for registering with Rosewood Pharmacy. To complete your registration and verify your email address, please use the verification code below:
              </p>

              <!-- Verification Code -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding: 30px 0;">
                    <div style="background-color: #F5F3EF; border: 2px dashed #D4AF37; padding: 20px 40px; display: inline-block;">
                      <div style="font-size: 32px; font-weight: 700; letter-spacing: 0.15em; color: #1A1A1A; font-family: 'Courier New', monospace;">
                        ${verificationCode}
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #6B6B6B;">
                This code will expire in <strong>${expiryMinutes} minutes</strong>. If you didn't create an account with Rosewood Pharmacy, please ignore this email.
              </p>

              <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #E5E5E5;">
                <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #ABABAB;">
                  For security reasons, never share this code with anyone. Rosewood Pharmacy will never ask for your verification code.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #F9F9F9; border-top: 1px solid #E5E5E5; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 12px; color: #6B6B6B;">
                © ${new Date().getFullYear()} Rosewood Pharmacy. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 11px; color: #ABABAB;">
                This is an automated message, please do not reply.
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

  const text = `
Verify Your Email - Rosewood Pharmacy

Hello ${name},

Thank you for registering with Rosewood Pharmacy. To complete your registration and verify your email address, please use the verification code below:

Verification Code: ${verificationCode}

This code will expire in ${expiryMinutes} minutes. If you didn't create an account with Rosewood Pharmacy, please ignore this email.

For security reasons, never share this code with anyone.

© ${new Date().getFullYear()} Rosewood Pharmacy. All rights reserved.
  `.trim();

  return { subject, html, text };
}
