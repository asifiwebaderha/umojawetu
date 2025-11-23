// utils/mail.js
const nodemailer = require('nodemailer');

function createTransport() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

async function sendMail(opts) {
  const transporter = createTransport();
  if (!transporter) return;
  return transporter.sendMail(opts);
}

module.exports = { createTransport, sendMail };
