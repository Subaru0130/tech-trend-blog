const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

const repoRoot = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(repoRoot, '.env.local') });

function readEnv(name) {
  const value = process.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

function isEnabled() {
  const raw = readEnv('REPORT_EMAIL_ENABLED');
  if (!raw) {
    return true;
  }

  return !['0', 'false', 'off', 'no'].includes(raw.toLowerCase());
}

function ensureFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }
}

async function main() {
  if (!isEnabled()) {
    console.log('[GSC Email] Skipped: REPORT_EMAIL_ENABLED is disabled.');
    return;
  }

  const reportPath = path.join(repoRoot, '.cache', 'gsc', 'weekly-report-latest.md');
  ensureFileExists(reportPath);

  const to = readEnv('REPORT_EMAIL_TO');
  const host = readEnv('SMTP_HOST');
  const port = Number.parseInt(readEnv('SMTP_PORT') || '465', 10);
  const user = readEnv('SMTP_USER');
  const pass = readEnv('SMTP_PASS');
  const from = readEnv('REPORT_EMAIL_FROM') || user;

  const missing = [];
  if (!to) missing.push('REPORT_EMAIL_TO');
  if (!host) missing.push('SMTP_HOST');
  if (!port) missing.push('SMTP_PORT');
  if (!user) missing.push('SMTP_USER');
  if (!pass) missing.push('SMTP_PASS');

  if (missing.length > 0) {
    console.log(`[GSC Email] Skipped: missing ${missing.join(', ')}`);
    return;
  }

  const reportText = fs.readFileSync(reportPath, 'utf8');
  const today = new Date().toISOString().slice(0, 10);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from,
    to,
    subject: `[ChoiceGuide] 週次GSCレポート ${today}`,
    text: `${reportText}\n\n---\nこのメールは ChoiceGuide の週次GSC監視タスクから自動送信されています。`,
    attachments: [
      {
        filename: `choiceguide-weekly-report-${today}.md`,
        path: reportPath,
      },
    ],
  });

  console.log(`[GSC Email] Sent weekly report to ${to}`);
}

main().catch((error) => {
  console.error('[GSC Email] Failed:', error.message);
  process.exit(1);
});
