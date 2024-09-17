// routes/auth-router.js
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user-models'); // Adjust the path to your User model
const { verifyToken } = require('../middlewares/auth-middleware');
const sendEmail = require('../config/mailer');
const sendSms = require('../config/sms-sender');
const authValidation = require('../helpers/auth-helper');
const router = express.Router();

// Google authentication route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',
}), (req, res) => {
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const userData = {
    userId: req.user._id,
    email: req.user.email,
    firstname: req.user.firstname,
    lastname: req.user.lastname,
    photo: req.user.photo,
  };

  console.log(userData);
  console.log(token)
  res.redirect(`http://localhost:3000/user/email-verification?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
});


router.get('/user-details', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Route to send OTP
router.post('/send-otp', async (req, res) => {
  const { field, value } = req.body;

  try {
    // Generate a new OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    // Define expiry time for the OTP (1 minute from now)
    const expiryTime = Date.now() + 60 * 1000; // Current time + 60 seconds

    // Store OTP and expiry time in session
    req.session.otp = {
      field,
      value,
      otp,
      expiryTime
    };

    const subject = 'Your OTP for Verification';
    const text = `Your OTP is ${otp}`;
    const html = `<p>Your OTP is <strong>${otp}</strong></p>`;

    if (field === 'email') {
      const response=await sendEmail(value, subject, text, html);
      if(response){
        res.status(200).json({ message: 'OTP sent successfully.' });
      }else{
        res.status(200).json({ message: 'Failed to send OTP. Please try again later.' });
      }
      
    }else if(field == 'phone'){
      const response=await sendSms(value, otp);
      if(response){
        res.status(200).json({ message: 'OTP sent successfully.' });
      }else{
        res.status(200).json({ message: 'Failed to send OTP. Please try again later.' });
      }
 
    }

    
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP. Please try again later.' });
  }
});


// Route to verify OTP
router.post('/verify-otp', async (req, res) => {
  const { field, value, otp ,userId} = req.body;

  try {
    const sessionOtp = req.session.otp;

    console.log("session", req.session.otp);

    if (!sessionOtp) {
      return res.status(400).json({ message: 'No OTP found. Please request an OTP first.' });
    }

    // Check if OTP has expired
    if (Date.now() > sessionOtp.expiryTime) {
      return res.status(200).json({ message: 'OTP has expired.' });
    }

    // Validate that the OTP matches
    if (otp === sessionOtp.otp && field === sessionOtp.field && value === sessionOtp.value) {
      const date = Date.now();

      if (field === "email") {
        const respond = await authValidation.emailVerified(value, date);
      } else if (field === "phone") {
        await authValidation.phoneVerified(value, date,userId);
      }

      // OTP verified successfully, respond accordingly
      req.session.otp = null; // Optionally, clear OTP from session
      res.status(200).json({ verified: true });
    } else {

      res.status(200).json({ message: 'Invalid OTP.' });
    }
  } catch (err) {
    req.session.otp = null;
    res.status(500).json({ message: 'An error occurred during OTP verification.' });
  }
});


module.exports = router;

