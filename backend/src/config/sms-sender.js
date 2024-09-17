const twilio = require('twilio');

const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber.startsWith('+')) {
    return `+91${phoneNumber.replace(/^0+/, '')}`; // Remove leading zeros and add country code
  }
  return phoneNumber;
};

const sendSms = async (to, otp) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  const client = twilio(accountSid, authToken);

  // Format the phone number
  const formattedNumber = formatPhoneNumber(to);

  try {
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: from,
      to: formattedNumber,
    });

    return true;
  } catch (error) {
    return false;
  }
};

module.exports = sendSms;
