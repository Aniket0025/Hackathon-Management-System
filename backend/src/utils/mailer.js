const nodemailer = require('nodemailer');

// Create a transporter using environment variables
const baseOptions = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: (process.env.SMTP_USER && process.env.SMTP_PASS) ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
};

// Optional TLS servername (useful when connecting via IP)
if (process.env.SMTP_TLS_SERVERNAME) {
  baseOptions.tls = { servername: process.env.SMTP_TLS_SERVERNAME };
}

const transporter = nodemailer.createTransport(baseOptions);

// Optional: verify transporter on startup in non-production
if (process.env.NODE_ENV !== 'production') {
  const dbg = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    user: process.env.SMTP_USER,
    from: process.env.MAIL_FROM,
    tls_servername: process.env.SMTP_TLS_SERVERNAME,
  };
  console.log('[mailer] Config:', { ...dbg, user: dbg.user ? dbg.user.replace(/(.{2}).+(@.*)/, '$1***$2') : undefined });
  transporter.verify().then(() => {
    console.log('[mailer] Transporter is ready');
  }).catch(err => {
    console.warn('[mailer] Transporter verify failed:', err.message);
  });
}

async function sendMail({ to, subject, text, html, from }) {
  const info = await transporter.sendMail({
    from: from || process.env.MAIL_FROM || 'no-reply@example.com',
    to,
    subject,
    text,
    html,
  });
  return info;
}

module.exports = { transporter, sendMail };
