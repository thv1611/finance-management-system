function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getOtpExpiryDate(minutes = 5) {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutes);
  return now;
}

module.exports = {
  generateOtp,
  getOtpExpiryDate,
};