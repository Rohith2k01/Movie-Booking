// helpers/razorpayHelpers.js
const Razorpay = require('razorpay'); // Import Razorpay
require('dotenv').config();

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createRazorpayOrder = async (amount) => {
    try {
        const options = {
            amount: amount, // Amount in paise
            currency: "INR",
            receipt: `receipt_order_${Math.random() * 1000}`,
        };

        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
};

module.exports = createRazorpayOrder;