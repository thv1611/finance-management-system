const nodemailer = require("nodemailer");
const env = require("./env");

const transporter = nodemailer.createTransport({
  host: env.mail.host,
  port: Number(env.mail.port),
  secure: false,
  auth: {
    user: env.mail.user,
    pass: env.mail.pass,
  },
});

async function sendOtpEmail(to, otpCode) {
  const subject = "Your OTP Verification Code";
  const text = `Your OTP code is: ${otpCode}. It will expire in ${env.otp.expiresMinutes} minutes.`;

  try {
    await transporter.sendMail({
      from: env.mail.from,
      to,
      subject,
      text,
    });
    console.log(`OTP email sent to ${to}`);
  } catch (error) {
    console.log("Mail sending failed, fallback to console log.");
    console.log(`OTP for ${to}: ${otpCode}`);
  }
}

async function sendPasswordResetOtpEmail(to, otpCode) {
  const subject = "Your SYM Password Reset Code";
  const text = `Use this SYM password reset code: ${otpCode}. It will expire in ${env.otp.expiresMinutes} minutes.`;

  try {
    await transporter.sendMail({
      from: env.mail.from,
      to,
      subject,
      text,
    });
    console.log(`Password reset email sent to ${to}`);
  } catch (error) {
    console.log("Mail sending failed, fallback to console log.");
    console.log(`Password reset OTP for ${to}: ${otpCode}`);
  }
}

module.exports = {
  transporter,
  sendOtpEmail,
  sendPasswordResetOtpEmail,
};
