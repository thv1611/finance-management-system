const nodemailer = require("nodemailer");
const env = require("./env");

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.mail.host,
      port: Number(env.mail.port),
      secure: Number(env.mail.port) === 465,
      family: 4,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: {
        user: env.mail.user,
        pass: env.mail.pass,
      },
    });
  }

  return transporter;
}

function parseMailFrom(value) {
  const match = String(value || "").match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (match) {
    return {
      name: match[1] || "Finance Management",
      email: match[2],
    };
  }

  return {
    name: "Finance Management",
    email: String(value || "").trim(),
  };
}

function getEmailProviderLabel() {
  return env.brevo.apiKey ? "brevo-api" : "smtp";
}

async function sendWithBrevoApi(to, subject, text) {
  const sender = parseMailFrom(env.mail.from);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    signal: controller.signal,
    headers: {
      accept: "application/json",
      "api-key": env.brevo.apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender,
      to: [{ email: to }],
      subject,
      textContent: text,
    }),
  }).finally(() => {
    clearTimeout(timeout);
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brevo API responded with ${response.status}: ${errorText}`);
  }
}

async function sendMail(to, subject, text) {
  console.log(`Sending email via ${getEmailProviderLabel()} to ${to}`);

  if (env.brevo.apiKey) {
    await sendWithBrevoApi(to, subject, text);
    return;
  }

  if (String(env.mail.host || "").includes("brevo")) {
    throw new Error("BREVO_API_KEY is missing. Add a Brevo API key that starts with xkeysib- in Render Environment.");
  }

  await getTransporter().sendMail({
    from: env.mail.from,
    to,
    subject,
    text,
  });
}

async function sendOtpEmail(to, otpCode) {
  const subject = "Your OTP Verification Code";
  const text = `Your OTP code is: ${otpCode}. It will expire in ${env.otp.expiresMinutes} minutes.`;

  try {
    await sendMail(to, subject, text);
    console.log(`OTP email sent to ${to}`);
  } catch (error) {
    error.message = `Failed to send OTP email: ${error.message}`;
    throw error;
  }
}

async function sendPasswordResetOtpEmail(to, otpCode) {
  const subject = "Your SYM Password Reset Code";
  const text = `Use this SYM password reset code: ${otpCode}. It will expire in ${env.otp.expiresMinutes} minutes.`;

  try {
    await sendMail(to, subject, text);
    console.log(`Password reset email sent to ${to}`);
  } catch (error) {
    error.message = `Failed to send password reset email: ${error.message}`;
    throw error;
  }
}

module.exports = {
  getTransporter,
  getEmailProviderLabel,
  sendOtpEmail,
  sendPasswordResetOtpEmail,
};
