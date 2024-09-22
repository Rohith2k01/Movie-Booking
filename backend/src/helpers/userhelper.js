const mongoose = require('mongoose');
const { Movie, movieSchedule,Theatre } = require('../models/admin');
const Booking = require('../models/booking')

module.exports = {
  getAllMovies: async () => {
    try {
      // Find all schedules and extract movie IDs
      const schedules = await movieSchedule.find().populate('movies.movie');

      // Extract movies from the schedules
      const movies = schedules.flatMap(schedule =>
        schedule.movies
        .map(movieEntry => movieEntry.movie)  // Map movie objects
        .filter(movie => movie && movie._id)  // Filter out null or undefined movies
      );

      // Ensure unique movies
      const uniqueMovies = Array.from(new Map(movies.map(movie => [movie._id.toString(), movie])).values());

      return uniqueMovies;
    } catch (error) {
      console.error('Error fetching all movies:', error);
      throw new Error('Error fetching all movies');
    }
  },



  getMovieDetails: async (movieId) => {
    try {
      // Fetch the movie details
      const movie = await Movie.findById(movieId).exec();

      if (!movie) {
        throw new Error('Movie not found');
      }

      // Return movie details with the additional fields
      return {
        _id: movie._id,
        title: movie.title,
        description: movie.description,
        duration: movie.duration,
        genre: movie.genre,
        certification: movie.certification,
        releaseDate: movie.releaseDate,
        image: movie.image,
        director: movie.director,  // Adding director
        cast: movie.cast,          // Adding cast
        imdbRating: movie.imdbRating,  // Adding IMDb rating
        language: movie.language    // Adding language
      };
    } catch (error) {
      throw new Error(`Failed to fetch movie details: ${error.message}`);
    }
  },


  getMovieSchedule: async (movieId) => {
    try {
      const schedule = await movieSchedule.find({ 'movies.movie': movieId })
        .populate('theatre')
        .populate('movies.movie')
        .exec();

      if (!schedule || schedule.length === 0) {
        throw new Error('No schedule found for this movie');
      }

      // Transform the data
      const transformedSchedule = schedule.map(theatreSchedule => ({
        theatreName: theatreSchedule.theatre.theatreName,
        location: theatreSchedule.theatre.location,
        movies: theatreSchedule.movies
          .filter(movie => movie.movie._id.toString() === movieId) // Filter to get the specific movie
          .map(movie => ({
            movieTitle: movie.movie.title,
            genre: movie.movie.genre,
            language: movie.movie.language,
            imdbRating: movie.movie.imdbRating,
            duration: movie.movie.duration,
            releaseDate: movie.movie.releaseDate,
            showDates: movie.showDates.map(showDate => ({
              date: showDate.date,
              times: showDate.times.map(time => ({
                time: time.time,
                seats: time.seats
              }))
            }))
          }))
      }));

      return transformedSchedule;
    } catch (error) {
      throw new Error(`Failed to fetch schedule: ${error.message}`);
    }
  },



  getSeatsForShowtime: async (theatreId, movieId, showDate, showTime) => {
    try {
      // Find the theatre by name
      const theatre = await Theatre.findOne({ theatreName: theatreId }).exec();
      if (!theatre) {
        throw new Error('Theatre not found');
      }

      // Find the movie schedule using the theatre's ObjectId
      const schedule = await movieSchedule.findOne({
        theatre: theatre._id,
        'movies.movie': movieId,
        'movies.showDates.date': showDate,
        'movies.showDates.times.time': showTime
      }).populate({
        path: 'movies.movie',
        select: 'title' // Fetch only the title from the movie document
      });

      if (!schedule) {
        throw new Error('Schedule not found for the selected theatre, movie, date, and time');
      }

      // Find the movie in the schedule
      const MovieSchedule = schedule.movies.find(m => m.movie._id.toString() === movieId);
      if (!MovieSchedule) {
        throw new Error('Movie not found in the schedule');
      }

      // Find the specific show date for the movie
      const showDateObj = MovieSchedule.showDates.find(date => date.date === showDate);
      if (!showDateObj) {
        throw new Error('Show date not found');
      }

      // Find the specific show time for the selected date
      const showtimeObj = showDateObj.times.find(time => time.time === showTime);
      if (!showtimeObj) {
        throw new Error('Showtime not found');
      }

      // Return the seats for the selected showtime
      return {
        seats: showtimeObj.seats,
        movieTitle: MovieSchedule.movie.title // Return movie title for the frontend
      };
    } catch (error) {
      throw new Error(`Failed to fetch seats: ${error.message}`);
    }
  },


  searchMoviesByTitle: async (title) => {
    try {
      if (!title) {
        throw new Error('Title is required');
      }

      // Use word boundaries to match complete words and make regex stricter
      const regex = new RegExp(`\\b${title}`, 'i');

      const movies = await Movie.find({
        title: { $regex: regex }
      });

      return movies;
    } catch (error) {
      throw new Error(`Failed to fetch movies: ${error.message}`);
    }
  },



  confirmBooking: async (bookingData) => {
    try {


      // Check if the user already has a booking
      let existingBooking = await Booking.findOne({ userId: bookingData.userDetails.userId });

      if (existingBooking) {
        // If the user has an existing booking, add the new booking details to the array
        existingBooking.bookings.push({
          movie: bookingData.movieTitle,
          theatre: bookingData.theatreId,
          date: bookingData.showDate,
          time: bookingData.showTime,
          seats: bookingData.selectedSeats,
          totalPrice: bookingData.totalPrice,
          paymentId: bookingData.paymentId,
        });

        // Save the updated booking
        const updatedBooking = await existingBooking.save();
        return updatedBooking;
      } else {
        // If no existing booking, create a new one
        const newBooking = new Booking({
          userId: bookingData.userDetails.userId,
          user: {
            firstname: bookingData.userDetails.firstname,
            lastname: bookingData.userDetails.lastname,
            email: bookingData.userDetails.email,
            phone: bookingData.userDetails.phone,
          },
          bookings: [{
            movie: bookingData.movieTitle,
            theatre: bookingData.theatreId,
            date: bookingData.showDate,
            time: bookingData.showTime,
            seats: bookingData.selectedSeats,
            totalPrice: bookingData.totalPrice,
            paymentId: bookingData.paymentId,
          }],
        });

        // Save the new booking
        const savedBooking = await newBooking.save();
        return savedBooking;
      }
    } catch (error) {
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
      throw new Error('Unable to update movie schedule.');
    }
  },



getUserBookings: async (userId) => {
  try {
    // Find bookings by userId
    const userBooking = await Booking.findOne({ userId }).lean();

    if (!userBooking) {
      return { status: 404, message: 'No bookings found for this user.' };
    }
    return { status: 200, data: userBooking };
  } catch (error) {
    throw new Error('Unable to fetch booking details.');
  }
},


getUserDetails: async (userId) => {
  try {
    const user = await User.findById(userId).select('-password'); // Exclude password
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    throw new Error(`Failed to fetch user details: ${error.message}`);
  }
},

};

