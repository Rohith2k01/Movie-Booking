const mongoose = require('mongoose');
const { Movie, movieSchedule,Theatre } = require('../models/admin-models');
const Booking = require('../models/booking-model')

module.exports = {
  getAllMovies: async () => {
    try {
      // Find all schedules and extract movie IDs
      const schedules = await movieSchedule.find().populate('movies.movie');

      // Extract movies from the schedules
      const movies = schedules.flatMap(schedule =>
        schedule.movies.map(movieEntry => movieEntry.movie)
      );

      // Ensure unique movies
      const uniqueMovies = Array.from(new Map(movies.map(movie => [movie._id.toString(), movie])).values());

      return uniqueMovies;
    } catch (error) {
      console.error('Error fetching all movies:', error);
      throw new Error('Error fetching all movies');
    }
  },



  confirmBooking: async (bookingData) => {
    try {
      // Create a new Booking document with the provided data
      const newBooking = new Booking({
        user: {
          firstname: bookingData.userDetails.firstname,
          lastname: bookingData.userDetails.lastname,
          email: bookingData.userDetails.email,
          phone:bookingData.userDetails.phone,
        },
        movie: bookingData.movieTitle,
        theatre: bookingData.theatreId,
        date: bookingData.showDate,
        time: bookingData.showTime,
        seats: bookingData.selectedSeats,
        totalPrice: bookingData.totalPrice,
        paymentId: bookingData.paymentId,
      });


      // Save the booking to the database
      const savedBooking = await newBooking.save();
      return savedBooking;
    } catch (error) {
      console.error('Error saving booking:', error);
      throw new Error('Unable to save booking.');
    }
  },

 
updateMovieSchedule: async ({ theatreId, movieTitle, showDate, showTime, selectedSeats, userId }) => {
  try {
    // Find the theatre by name
    const theatre = await Theatre.findOne({ theatreName: theatreId }).exec();
    if (!theatre) {
      return res.status(404).json({ message: 'Theatre not found' });
    }

    // Find the movie by title and get its ObjectId
    const movie = await Movie.findOne({ title: movieTitle }).exec();
    if (!movie) {
      throw new Error('Movie not found.');
    }

    // Now use the movie's ObjectId to find the schedule
    const schedule = await movieSchedule.findOne({
      theatre: theatre._id,  // Use theatre's ObjectId
      'movies.movie': movie._id,  // Use the movie's ObjectId
    });

    if (!schedule) {
      throw new Error('Schedule not found for this theatre and movie.');
    }

    // Find the movie in the schedule
    const MovieSchedule = schedule.movies.find(m => m.movie.toString() === movie._id.toString());
    if (!MovieSchedule) {
      throw new Error('Movie not found in the schedule.');
    }

    // Find the corresponding show date
    const show = MovieSchedule.showDates.find(s => s.date === showDate);
    if (!show) {
      throw new Error('Show date not found.');
    }

    // Find the corresponding show time
    const timeSlot = show.times.find(t => t.time === showTime);
    if (!timeSlot) {
      throw new Error('Show time not found.');
    }

    // Update the seats array, marking selected seats as booked
    selectedSeats.forEach(seatNumber => {
      const seat = timeSlot.seats.find(s => s.seatNumber === seatNumber);
      if (seat) {
        seat.isBooked = true;
        seat.bookedBy = mongoose.Types.ObjectId.isValid(userId) ? userId : null; // Validate userId
      }
    });

    // Save the updated schedule
    await schedule.save();
  } catch (error) {
    console.error('Error updating movie schedule:', error);
    throw new Error('Unable to update movie schedule.');
  }
},
};
