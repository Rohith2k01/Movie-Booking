const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    firstname: String,
    lastname: String,
    email: String,
    phone:String,
  },
  movie: String,
  theatre: String,
  date: String,
  time: String,
  seats: [String],
  totalPrice: Number,
  paymentId: String,
  bookingDate: {
    type: Date,
    default: Date.now,
  },
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
