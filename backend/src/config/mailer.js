// mailer.js
const nodemailer = require("nodemailer");

const sendEmail = async (recipientEmail, subject, text, html) => {
  try {
    // Create a transporter object with your email service configurations
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // e.g., Gmail, Yahoo, Outlook (or use a custom service)
      auth: {
        user: process.env.EMAIL_USER, // Email account to send from (setup in your .env)
        pass: process.env.EMAIL_PASS, // Password or app-specific password (setup in your .env)
      },
    });

    // Email details
    const mailOptions = {
      from: process.env.EMAIL_USER, 
      to: recipientEmail, 
      subject: subject, 
      text: text, 
      html: html, 
    };

    // Send email 
    await transporter.sendMail(mailOptions);
    
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = sendEmail;
