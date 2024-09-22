const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { // Add the userId field
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Assuming there is a User collection
  },
  user: {
    firstname: String,
    lastname: String,
    email: String,
    phone: String,
  },
  bookings: [ // Store all booking details in an array
    {
      movie: String,
      theatre: String,
      date: String,
      time: String,
      seats: [String],
      totalPrice: Number,
      paymentId: String,
    }
  ],
  bookingDate: {
    type: Date,
    default: Date.now,
  },
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;