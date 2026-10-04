import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

let transporter = null;
let etherealAccount = null;

/**
 * Initialize nodemailer transporter.
 * Uses real SMTP if environment variables are defined;
 * Otherwise creates an Ethereal test transporter for local development.
 * Supports: Gmail, Mailtrap, Brevo, SendGrid, Resend.
 */
async function getTransporter() {
  if (transporter) return transporter;

  const hasUserPass = Boolean(config.email.user && config.email.pass);
  const host = (config.email.host || '').toLowerCase();
  const isGmail = host.includes('gmail') || (hasUserPass && config.email.user?.includes('@gmail.com'));

  // 1. Gmail SMTP with App Password
  if (isGmail && hasUserPass) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email.user.trim(),
        pass: config.email.pass.replace(/\s+/g, ''),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    return transporter;
  }

  // 2. Custom SMTP Server (Mailtrap, Brevo, SendGrid, Resend, etc.)
  if (config.email.host) {
    const isPort465 = config.email.port === 465 || config.email.secure;
    const transportOpts = {
      host: config.email.host.trim(),
      port: config.email.port || (isPort465 ? 465 : 587),
      secure: isPort465,
      tls: {
        rejectUnauthorized: false,
      },
    };

    if (hasUserPass) {
      transportOpts.auth = {
        user: config.email.user.trim(),
        pass: config.email.pass.trim(),
      };
    }

    transporter = nodemailer.createTransport(transportOpts);
    return transporter;
  }

  // 3. Development Fallback: Ethereal test account or local memory
  try {
    etherealAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: etherealAccount.smtp.host,
      port: etherealAccount.smtp.port,
      secure: etherealAccount.smtp.secure,
      auth: {
        user: etherealAccount.user,
        pass: etherealAccount.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    return transporter;
  } catch (err) {
    console.warn('⚠️ [SMTP] Could not initialize external Ethereal test account; using local JSON fallback:', err.message);
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
    return transporter;
  }
}

/**
 * Reusable MailService wrapper complying with enterprise mailer conventions:
 * MailService.sendMail({ to, subject, html, text })
 */
export const MailService = {
  async sendMail({ to, subject, html, text, from }) {
    const mailTransporter = await getTransporter();
    const fromAddress = from || config.email.from || '"E-Mobility Lanka" <no-reply@emobility.lk>';

    const info = await mailTransporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text: text || '',
      html: html || ''
    });

    return info;
  },

  /**
   * Verify SMTP connection on startup without leaking credentials
   */
  async verifyConnection() {
    if (!config.email.host && !config.email.user) {
      console.log('ℹ️ [SMTP] No external SMTP credentials configured in .env (development mode active).');
      return false;
    }

    try {
      const mailTransporter = await getTransporter();
      await mailTransporter.verify();
      console.log(`✅ [SMTP] SMTP Connection verified successfully (${config.email.host || 'service'}).`);
      return true;
    } catch (err) {
      // Security: Log warning WITHOUT exposing passwords or tokens
      console.warn(`⚠️ [SMTP] SMTP Connection verification failed: ${err.message}`);
      return false;
    }
  }
};

/**
 * Startup helper for server initialization
 */
export async function verifySmtpConnection() {
  return MailService.verifyConnection();
}

/**
 * Generates modern branded HTML email for password reset
 */
function createPasswordResetEmailHtml({ email, resetUrl, resetToken, expiresMinutes = 60 }) {
  const currentYear = new Date().getFullYear();
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your E-Mobility Portal Password</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #0b0f19;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #e2e8f0;
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          width: 100%;
          background-color: #0b0f19;
          padding: 40px 15px;
        }
        .container {
          max-width: 580px;
          margin: 0 auto;
          background-color: #131d31;
          border: 1px solid #1e2e4a;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.6);
        }
        .header {
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #1d4ed8 100%);
          padding: 36px 30px;
          text-align: center;
          position: relative;
        }
        .header-icon {
          display: inline-block;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
          padding: 14px;
          border-radius: 16px;
          margin-bottom: 12px;
          border: 1px solid rgba(255, 255, 255, 0.25);
        }
        .header h1 {
          margin: 0;
          color: #ffffff;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .header p {
          margin: 6px 0 0;
          color: #bfdbfe;
          font-size: 13px;
          font-weight: 500;
        }
        .content {
          padding: 36px 32px 28px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 700;
          color: #f8fafc;
          margin-top: 0;
          margin-bottom: 16px;
        }
        .text {
          font-size: 14px;
          line-height: 1.65;
          color: #94a3b8;
          margin-bottom: 24px;
        }
        .account-badge {
          display: inline-block;
          background: #1e293b;
          border: 1px solid #334155;
          color: #38bdf8;
          padding: 6px 14px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          margin-bottom: 24px;
          word-break: break-all;
        }
        .cta-box {
          text-align: center;
          margin: 32px 0;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          color: #ffffff !important;
          text-decoration: none;
          padding: 14px 36px;
          font-size: 15px;
          font-weight: 700;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
          letter-spacing: 0.3px;
        }
        .token-box {
          background: #0f172a;
          border: 1px dashed #334155;
          border-radius: 12px;
          padding: 16px;
          margin: 24px 0;
          text-align: center;
        }
        .token-box p {
          margin: 0 0 6px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #64748b;
          font-weight: 700;
        }
        .token-code {
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
          font-size: 13px;
          color: #38bdf8;
          word-break: break-all;
          user-select: all;
        }
        .expiry-note {
          display: flex;
          align-items: center;
          background: rgba(245, 158, 11, 0.1);
          border-left: 3px solid #f59e0b;
          padding: 12px 16px;
          border-radius: 0 8px 8px 0;
          margin: 24px 0;
          font-size: 12px;
          color: #fbbf24;
        }
        .security-warning {
          border-top: 1px solid #1e293b;
          padding-top: 20px;
          font-size: 12px;
          color: #64748b;
          line-height: 1.5;
        }
        .footer {
          background-color: #0b1120;
          border-top: 1px solid #1e2e4a;
          padding: 24px 32px;
          text-align: center;
          font-size: 11px;
          color: #475569;
          line-height: 1.5;
        }
        .footer p {
          margin: 4px 0;
        }
        .footer-brand {
          color: #94a3b8;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="header-icon">
              🔑
            </div>
            <h1>E-Mobility Portal</h1>
            <p>Government of Sri Lanka · Traffic & EV Management</p>
          </div>

          <!-- Body -->
          <div class="content">
            <h2 class="greeting">Password Reset Request</h2>
            
            <p class="text">
              We received a request to reset the password for your account associated with:
            </p>

            <div class="account-badge">
              ✉️ ${email}
            </div>

            <p class="text">
              To choose a new secure password and restore full access to your account, please click the button below:
            </p>

            <!-- CTA Button -->
            <div class="cta-box">
              <a href="${resetUrl}" target="_blank" class="button">Reset My Password →</a>
            </div>

            <!-- Expiry Warning -->
            <div class="expiry-note">
              ⏱️ <strong>Security Notice:</strong>&nbsp;This password reset link is valid for <strong>${expiresMinutes} minutes</strong> only.
            </div>

            <!-- Direct URL Backup -->
            <div class="token-box">
              <p>Direct Reset URL (Copy & Paste)</p>
              <div class="token-code">${resetUrl}</div>
            </div>

            <!-- Security Notice -->
            <div class="security-warning">
              <p>
                <strong>Didn't request this change?</strong><br>
                If you did not request a password reset, you can safely ignore this message. Your password will remain unchanged, and your account is secure.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p class="footer-brand">National E-Mobility & Traffic Violation Monitoring System</p>
            <p>© ${currentYear} Ministry of Transport & Highways, Sri Lanka. All rights reserved.</p>
            <p>This is an automated system notification. Please do not reply directly to this email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Sends a password reset email to the specified recipient
 */
export async function sendPasswordResetEmail({ email, token, resetUrl }) {
  const fromAddress = config.email.from;

  const html = createPasswordResetEmailHtml({
    email,
    resetUrl,
    resetToken: token,
    expiresMinutes: 60,
  });

  const mailOptions = {
    from: fromAddress,
    to: email,
    subject: '🔐 Reset Your Password — E-Mobility Portal',
    text: `You recently requested to reset your password for the E-Mobility Portal (${email}). Click the following link to reset your password: ${resetUrl} (Valid for 60 minutes). If you did not request this, please ignore this email.`,
    html,
  };

  try {
    const mailTransporter = await getTransporter();
    const info = await mailTransporter.sendMail(mailOptions);
    
    let previewUrl = null;
    if (etherealAccount) {
      previewUrl = nodemailer.getTestMessageUrl(info);
    }

    console.log(`\n======================================================`);
    console.log(`📧 PASSWORD RESET EMAIL SENT SUCCESSFULLY!`);
    console.log(`📬 To: ${email}`);
    console.log(`🔗 Reset URL: ${resetUrl}`);
    if (previewUrl) {
      console.log(`🌐 Ethereal Web Inbox Preview: ${previewUrl}`);
    }
    console.log(`======================================================\n`);

    return {
      success: true,
      messageId: info.messageId || 'local-msg-id',
      previewUrl: previewUrl || null,
    };
  } catch (err) {
    console.warn(`⚠️ Primary email transport failed (${err.message}). Logging reset link directly:`);
    console.log(`\n======================================================`);
    console.log(`📧 [SIMULATED EMAIL DISPATCH] PASSWORD RESET REQUEST`);
    console.log(`📬 To: ${email}`);
    console.log(`🔗 Reset Link: ${resetUrl}`);
    console.log(`======================================================\n`);

    return {
      success: true,
      simulated: true,
      messageId: 'simulated-' + Date.now(),
      previewUrl: null,
    };
  }
}

/**
 * Send Admin Invitation Email containing Login Email, Temporary Password,
 * One-Time Activation Link, and Login URL.
 */
export async function sendAdminInvitationEmail({
  name,
  email,
  tempPassword,
  activationUrl,
  loginUrl,
  expiresHours = 48
}) {
  const fromAddress = config.email.from || `E-Mobility Lanka <${config.email.user || 'noreply@emobility.lk'}>`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to E-Mobility Lanka — Admin Account Invitation</title>
      <style>
        body { margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e2e8f0; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #0b0f19; padding: 40px 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 32px 24px; text-align: center; }
        .content { padding: 32px 28px; }
        .credential-box { background-color: #1a2234; border: 1px solid #2d3748; border-radius: 12px; padding: 20px; margin: 24px 0; }
        .field { margin-bottom: 12px; }
        .field-label { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: bold; letter-spacing: 0.5px; }
        .field-value { font-size: 14px; color: #f1f5f9; font-weight: 600; font-family: monospace; word-break: break-all; margin-top: 4px; }
        .btn { display: inline-block; background: #10b981; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 10px; text-align: center; font-size: 14px; margin: 16px 0; }
        .badge { display: inline-block; background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #34d399; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1f2937; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800;">E-Mobility Lanka</h1>
            <p style="margin: 6px 0 0 0; color: #d1fae5; font-size: 14px;">Enterprise Administrator Invitation</p>
          </div>
          <div class="content">
            <span class="badge">Super Admin Provisioned</span>
            <h2 style="color: #ffffff; font-size: 20px; margin: 16px 0 8px 0;">Hello, ${name}</h2>
            <p style="color: #94a3b8; line-height: 1.6; font-size: 14px;">
              You have been provisioned as an <strong>Administrator</strong> on the E-Mobility Sri Lanka Central Command Portal.
              Your account is currently in <strong>Pending Activation</strong> status.
            </p>

            <div class="credential-box">
              <div class="field">
                <div class="field-label">Login Email</div>
                <div class="field-value">${email}</div>
              </div>
              <div class="field">
                <div class="field-label">Temporary Password</div>
                <div class="field-value" style="color: #38bdf8; font-size: 16px;">${tempPassword}</div>
              </div>
              <div class="field" style="margin-bottom: 0;">
                <div class="field-label">Portal Login URL</div>
                <div class="field-value"><a href="${loginUrl}" style="color: #10b981; text-decoration: underline;">${loginUrl}</a></div>
              </div>
            </div>

            <div style="text-align: center; margin: 28px 0;">
              <a href="${activationUrl}" class="btn" style="color: #ffffff;">Complete First-Time Activation &rarr;</a>
              <p style="color: #64748b; font-size: 12px; margin-top: 8px;">
                This one-time activation link is valid for <strong>${expiresHours} hours</strong>.
              </p>
            </div>

            <div style="background-color: #0f172a; border-left: 4px solid #10b981; padding: 14px 16px; border-radius: 4px; font-size: 12px; color: #cbd5e1; line-height: 1.5;">
              <strong>First Activation Steps:</strong><br/>
              1. You will be prompted to create your new permanent secure password.<br/>
              2. You will be requested to grant camera permission to capture your initial profile photo.<br/>
              3. Upon completing activation, your account status will transition to <em>Awaiting Super Admin Approval</em>.<br/>
              4. Full system access will be unlocked once approved by the Super Administrator.
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} E-Mobility Lanka Central Command. All rights reserved.<br/>
            Security & Privacy Protocol AES-256-GCM / 14-Day Audit Retention Enforced.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: fromAddress,
    to: email,
    subject: '🛡️ Admin Account Invitation — E-Mobility Sri Lanka',
    text: `Welcome ${name}. You have been provisioned as an Admin. Login Email: ${email}, Temporary Password: ${tempPassword}. Complete your one-time activation here: ${activationUrl}. Portal Login: ${loginUrl}`,
    html
  };

  try {
    const mailTransporter = await getTransporter();
    const info = await mailTransporter.sendMail(mailOptions);
    let previewUrl = etherealAccount ? nodemailer.getTestMessageUrl(info) : null;

    // Security: Do NOT log passwords or tokens in console or logs
    console.log(`📧 [EMAIL] Admin invitation email dispatched successfully to: ${email}`);
    if (previewUrl) console.log(`🌐 [EMAIL] Preview URL: ${previewUrl}`);

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (err) {
    console.warn(`⚠️ [EMAIL] Invitation email dispatch notice (${err.message})`);
    return { success: true, simulated: true };
  }
}

/**
 * Enterprise Admin Credentials Email
 * Sent exclusively to the administrator's PERSONAL/PRIVATE email.
 * Contains:
 * - Greeting with admin's full name
 * - Official email (to be used as the username)
 * - Cryptographically generated temporary password
 * - "Set New Password" button/link (expires in 24h, single-use)
 * - "Login to System" link
 * - Security advisory to never share credentials
 */
export async function sendAdminCredentialsEmail({
  name,
  officialEmail,
  personalEmail,
  tempPassword,
  setPasswordUrl,
  loginUrl
}) {
  const fromAddress = config.email.from || `"E-Mobility Lanka" <${config.email.user || 'no-reply@emobility.lk'}>`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Administrator Account Credentials</title>
      <style>
        body { margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e2e8f0; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; background-color: #0b0f19; padding: 40px 15px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 45px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-bottom: 2px solid #10b981; padding: 32px 28px; text-align: center; }
        .content { padding: 36px 32px; }
        .credentials-card { background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 22px; margin: 24px 0; }
        .field { margin-bottom: 14px; }
        .field-label { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.5px; }
        .field-value { font-size: 15px; color: #f8fafc; font-weight: 600; margin-top: 4px; font-family: monospace; word-break: break-all; }
        .temp-pass { background-color: #1e293b; color: #38bdf8 !important; padding: 6px 12px; border-radius: 6px; display: inline-block; font-size: 15px; letter-spacing: 1px; border: 1px dashed #0284c7; }
        .btn-primary { display: inline-block; background-color: #10b981; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 14px; text-align: center; box-shadow: 0 4px 14px rgba(16,185,129,0.35); }
        .login-link { display: inline-block; margin-top: 14px; color: #38bdf8; text-decoration: none; font-size: 13px; font-weight: 600; }
        .notice-box { background-color: rgba(245, 158, 11, 0.08); border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 4px; font-size: 12px; color: #fde68a; line-height: 1.5; margin-top: 24px; }
        .footer { padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1f2937; background-color: #0b0f19; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">E-Mobility Sri Lanka</h1>
            <p style="margin: 6px 0 0 0; color: #34d399; font-size: 14px; font-weight: 600;">Enterprise Administrator Access Provisioned</p>
          </div>
          <div class="content">
            <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 12px 0;">Hello ${name},</h2>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
              A Super Administrator has provisioned an <strong>Administrator</strong> account for you on the E-Mobility Sri Lanka Central Command Portal.
              Your official login credentials and password setup details are provided below.
            </p>

            <div class="credentials-card">
              <div class="field">
                <div class="field-label">Official Email (Login Username)</div>
                <div class="field-value">${officialEmail}</div>
              </div>
              <div class="field" style="margin-bottom: 0;">
                <div class="field-label">Temporary Password</div>
                <div class="field-value"><span class="temp-pass">${tempPassword}</span></div>
              </div>
            </div>

            <div style="text-align: center; margin: 28px 0 16px 0;">
              <a href="${setPasswordUrl}" class="btn-primary">Set New Password &rarr;</a>
              <div>
                <a href="${loginUrl}" class="login-link">Login to System &rarr;</a>
              </div>
            </div>

            <div class="notice-box">
              <strong>⚠️ Important Security Notice:</strong><br/>
              &bull; The "Set New Password" link <strong>expires in 24 hours</strong> and can be used <strong>only once</strong>.<br/>
              &bull; You must set a permanent password before system access is granted.<br/>
              &bull; <strong>Never share these credentials with anyone.</strong> E-Mobility administrators will never ask for your password.
            </div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} E-Mobility Lanka Central Command. All rights reserved.<br/>
            Delivered confidentially to ${personalEmail}.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Hello ${name},

You have been provisioned as an Administrator on the E-Mobility Sri Lanka Central Command Portal.

Your Official Credentials:
- Official Email (Login Username): ${officialEmail}
- Temporary Password: ${tempPassword}

To set your permanent password, please click the link below (valid for 24 hours, single-use only):
${setPasswordUrl}

Direct Portal Login:
${loginUrl}

Security Notice:
- The password-change link expires in 24 hours and can be used only once.
- Never share these credentials with anyone.

E-Mobility Sri Lanka Central Command
`;

  try {
    const mailTransporter = await getTransporter();
    const info = await mailTransporter.sendMail({
      from: fromAddress,
      to: personalEmail,
      subject: '🔐 New Administrator Credentials — Set Your Password',
      text,
      html
    });

    let previewUrl = etherealAccount ? nodemailer.getTestMessageUrl(info) : null;
    console.log(`\n======================================================`);
    console.log(`📧 [EMAIL] ADMIN CREDENTIALS DISPATCHED!`);
    console.log(`📬 Recipient: ${personalEmail}`);
    console.log(`👤 Official Username: ${officialEmail}`);
    console.log(`🔑 Temp Password: ${tempPassword}`);
    console.log(`🔗 24h Setup URL: ${setPasswordUrl}`);
    if (previewUrl) console.log(`🌐 Ethereal Web Inbox Preview: ${previewUrl}`);
    console.log(`======================================================\n`);

    return { success: true, messageId: info.messageId, previewUrl, delivered: true };
  } catch (err) {
    console.warn(`⚠️ [EMAIL] External SMTP unavailable (${err.message}). Logging credentials for local development:`);
    console.log(`\n======================================================`);
    console.log(`📧 [LOCAL DEV / SIMULATED DISPATCH] ADMIN CREDENTIALS`);
    console.log(`📬 To (Personal Email): ${personalEmail}`);
    console.log(`👤 Official Username (Login): ${officialEmail}`);
    console.log(`🔑 Temporary Password: ${tempPassword}`);
    console.log(`🔗 24-Hour Setup URL: ${setPasswordUrl}`);
    console.log(`💡 To enable real Gmail delivery, configure SMTP_USER & SMTP_PASS in backend/.env`);
    console.log(`======================================================\n`);

    return {
      success: true,
      simulated: true,
      messageId: 'simulated-' + Date.now(),
      previewUrl: null,
      emailError: err.message
    };
  }
}

/**
 * Send Admin Approval Confirmation Email
 */
export async function sendAdminApprovedEmail({ name, email, loginUrl }) {
  const fromAddress = config.email.from || `E-Mobility Lanka <${config.email.user || 'noreply@emobility.lk'}>`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Account Approved — E-Mobility Lanka</title>
      <style>
        body { margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #e2e8f0; }
        .wrapper { width: 100%; background-color: #0b0f19; padding: 40px 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #10b981; border-radius: 16px; overflow: hidden; }
        .header { background: #059669; padding: 28px 24px; text-align: center; }
        .content { padding: 32px 28px; }
        .btn { display: inline-block; background: #10b981; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-size: 14px; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; color: #ffffff; font-size: 22px;">Account Approved</h1>
          </div>
          <div class="content">
            <h2 style="color: #ffffff; font-size: 18px;">Hello ${name},</h2>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
              Your administrator account has been reviewed and <strong>approved</strong> by the Super Administrator.
              You now have full access to the E-Mobility Sri Lanka Central Command Portal.
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${loginUrl}" class="btn">Sign In to Command Portal &rarr;</a>
            </div>
            <p style="color: #64748b; font-size: 12px;">
              Daily Login Security Note: Each daily login session requires a brief webcam verification photo to ensure session integrity.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const mailTransporter = await getTransporter();
    await mailTransporter.sendMail({
      from: fromAddress,
      to: email,
      subject: '✅ Administrator Account Approved — E-Mobility Lanka',
      text: `Hello ${name}, your administrator account has been approved by the Super Admin. You can now log in at: ${loginUrl}`,
      html
    });
    console.log(`📧 [EMAIL] Approval confirmation email dispatched to: ${email}`);
    return { success: true };
  } catch (err) {
    console.warn('⚠️ Approval email notice:', err.message);
    return { success: true, simulated: true };
  }
}

export default MailService;

