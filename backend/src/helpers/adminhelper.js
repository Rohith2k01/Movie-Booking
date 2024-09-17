const { trusted } = require('mongoose');
const { Movie, Theatre, movieSchedule } = require('../models/admin');
const generateSeats = (capacity) => {
  const seats = [];
  const rows = Math.ceil(capacity / 20); // Assuming 10 seats per row
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let row = 0; row < rows; row++) {
    for (let seat = 1; seat <= 20; seat++) {
      const seatNumber = `${alphabet[row]}${seat}`;
      seats.push({
        seatNumber,
        isBooked: false,
        bookedBy: null
      });

      if (seats.length === capacity) break; // Stop when capacity is reached
    }
    if (seats.length === capacity) break;
  }

  return seats;
};


module.exports = {



  addMovie: async (movieDetails) => {
    try {
      // Check if a movie with the same title and release date already exists
      const existingMovie = await Movie.findOne({
        title: movieDetails.title,
        releaseDate: movieDetails.releaseDate
      });

      if (existingMovie) {
        // If the movie already exists, return an error message
        return { error: "A movie with the same title and release date already exists." };
      }

      // Proceed with movie creation if no existing movie was found
      const movie = new Movie({
        title: movieDetails.title,
        description: movieDetails.description,
        duration: movieDetails.duration,
        genre: movieDetails.genre,
        certification: movieDetails.certification,
        releaseDate: movieDetails.releaseDate,
        image: movieDetails.imageUrl,
        director: movieDetails.director, // Add director
        cast: movieDetails.cast, // Add cast
        imdbRating: movieDetails.imdbRating, // Add IMDb rating
        language: movieDetails.language // Add language
      });

      const savedMovie = await movie.save();
      const movieId = savedMovie._id.toString();
      return movieId;

    } catch (error) {
      // Handle and return any errors that occur
      return error.message;
    }

  },

  addTheatre: async (theatreDetials) => {

    try {

      const newTheatre = new Theatre({
        theatreName: theatreDetials.theatreName,
        location: theatreDetials.location,
        screenResolution: theatreDetials.screenResolution,
        amenities: theatreDetials.amenities,
        capacity: theatreDetials.capacity

      });
      await newTheatre.save();

      const savedTheatre = await movie.save();
      theatreId = savedTheatre._id.toString()
      return (movieId);


    } catch (error) {
      return error
    }

  },



  getMoviesList: async () => {

    try {
      const movies = await Movie.find();
      return movies;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw new Error('Error fetching movie details');
    }

  },


  deleteMovie: async (movieId) => {

    try {
      await Movie.findByIdAndDelete(movieId);

      return true;
    } catch (error) {
      console.error('Error deleting movie details:', error);
      throw new Error('Error deleting movie details');
    }

  },


  getTheatreList: async () => {

    try {
      const theatres = await Theatre.find();
      return theatres;
    } catch (error) {
      console.error('Error fetching theatre details:', error);
      throw new Error('Error fetching theatre details');
    }

  },



  addMovieSchedule: async (movieId, theatreId, showtime) => {
    try {
      // Find the theatre
      const theatre = await Theatre.findById(theatreId);
      if (!theatre) {
        return { error: 'The specified theatre does not exist.' };
      }

      // Find the movie
      const movie = await Movie.findById(movieId);
      if (!movie) {
        return { error: 'The specified movie does not exist.' };
      }

      // Find or create the schedule for the theatre
      let schedule = await movieSchedule.findOne({ theatre: theatreId });

      if (!schedule) {
        // Create a new schedule if none exists
        schedule = new movieSchedule({
          theatre: theatreId,
          movies: [{
            movie: movieId,
            showDates: [{
              date: showtime.date,
              times: [{
                time: showtime.time,
                seats: generateSeats(theatre.capacity)
              }]
            }]
          }]
        });
        await schedule.save();
      } else {
        // Update the existing schedule
        const movieEntry = schedule.movies.find(m => m.movie.toString() === movieId.toString());

        if (movieEntry) {
          // Update existing movie schedule
          let dateEntry = movieEntry.showDates.find(d => d.date === showtime.date);

          if (dateEntry) {
            // Check for existing time
            let timeEntry = dateEntry.times.find(t => t.time === showtime.time);

            if (timeEntry) {
              return { error: 'A schedule for the same movie, date, and time already exists.' };
            } else {
              // Add new time with seats
              dateEntry.times.push({
                time: showtime.time,
                seats: generateSeats(theatre.capacity)
              });
            }
          } else {
            // Add new date with time and seats
            movieEntry.showDates.push({
              date: showtime.date,
              times: [{
                time: showtime.time,
                seats: generateSeats(theatre.capacity)
              }]
            });
          }
        } else {
          // Add new movie to the schedule
          schedule.movies.push({
            movie: movieId,
            showDates: [{
              date: showtime.date,
              times: [{
                time: showtime.time,
                seats: generateSeats(theatre.capacity)
              }]
            }]
          });
        }

        // Save the updated schedule
        await schedule.save();
      }

      return { message: 'Movie schedule updated successfully!' };
    } catch (error) {
      console.error('Error updating movie schedule:', error);
      return { error: 'Failed to update movie schedule. Please try again.' };
    }
  },



  getSchedulesList: async () => {
    try {
      const schedules = await movieSchedule.find()
        .populate('theatre', 'theatreName') // Populate theatre name
        .populate('movies.movie', 'title') // Populate movie title
        .exec(); // Use exec() to get the results

      console.log(schedules); // For debugging
      return schedules;
    } catch (error) {
      console.error("Error fetching schedules:", error);
      throw error;
    }
  },


  deleteShowtime: async (scheduleId, movieId, date, time) => {
    try {
      // Find the schedule by ID
      const schedule = await movieSchedule.findById(scheduleId);

      if (!schedule) {
        return { success: false, message: 'Schedule not found' };
      }

      // Find the movie entry in the schedule
      const movieEntry = schedule.movies.find(movie => movie.movie._id.toString() === movieId);

      if (!movieEntry) {
        return { success: false, message: 'Movie not found in schedule' };
      }

      // Find the date entry to update
      const showDate = movieEntry.showDates.find(st => st.date === date);

      if (!showDate) {
        return { success: false, message: 'Date not found for movie in schedule' };
      }

      // Remove the specified time from the date
      showDate.times = showDate.times.filter(t => t.time !== time);

      if (showDate.times.length === 0) {
        // Remove the date entry if no times are left
        movieEntry.showDates = movieEntry.showDates.filter(st => st.date !== date);
      }

      if (movieEntry.showDates.length === 0) {
        // Remove the movie entry if no show dates are left
        schedule.movies = schedule.movies.filter(movie => movie.movie._id.toString() !== movieId);
      }

      // Check if there are no remaining movie entries
      if (schedule.movies.length === 0) {
        // Delete the entire schedule if no movies are left
        await movieSchedule.findByIdAndDelete(scheduleId);
        return { success: true, message: 'Schedule deleted successfully' };
      }

      // Save the updated schedule
      await schedule.save();

      return { success: true, message: 'Showtime deleted successfully' };

    } catch (error) {
      console.error(error);
      return { success: false, message: 'Failed to delete showtime' };
    }
  }






}