const express = require("express");
const multer = require("multer");
const path = require("path");
const adminApi = require("../../helpers/adminapi");
const adminHelper = require('../../helpers/adminhelper')
const router = express.Router();
const axios = require('axios');
const { movieSchedule, Movie } = require('../../models/admin')



// Setup storage for `multer`
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//       cb(null, uniqueSuffix + path.extname(file.originalname)); // Save file with unique name
//     }
//   });

//   const upload = multer({ storage: storage });



// GET route to search for a movie by title and year
router.get('/movies-lookup', async (req, res) => {
  try {
    const { title, year } = req.query;
    // Implement movie search logic here
    // For example, you might use an external API like OMDB to fetch movie details
    const searchMovieApi = await adminApi.searchMovie(title, year);

    const movieDetails = await axios.get(searchMovieApi);

    console.log(movieDetails.data)


    if (movieDetails.data.Response == 'False') {
      res.status(200).json({ message: 'Failed to fetch movie details.', error: movieDetails.data.Error });
    } else {
      res.status(200).json(movieDetails.data);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch movie details.', error: error.message });
  }
});




router.post('/add-movies', async (req, res) => {
  try {-
    console.log("Received movie data:", req.body);
    console.log("Received file:", req.file);

    const { title, description, duration, genre, certification, releaseDate, imageUrl, director, cast, imdbRating, language } = req.body;

    // Check if required fields are missing
    if (!title || !description || !duration || !genre || !certification || !releaseDate) {
      return res.status(400).json({ error: "All required fields must be provided." });
    }

    // Movie object to save
    const movieDetails = {
      title,
      description,
      duration,
      genre,
      certification,
      releaseDate,
      imageUrl, // Use imageUrl from API or uploaded
      director, // Include director
      cast: cast.split(',').map(actor => actor.trim()), // Convert to array
      imdbRating, // Include IMDb rating
      language // Include language
    };

    console.log("Movie to be added:", movieDetails);

    // Save movie details to the database
    const storedMovieDetails = await adminHelper.addMovie(movieDetails);

    if (storedMovieDetails.error) {
      // If there was an error in adding the movie
      return res.status(400).json({ error: storedMovieDetails.error });
    }

    res.status(200).json({ success: true, message: "Movie added successfully!", movieId: storedMovieDetails });
  } catch (error) {
    console.error("Error while adding movie:", error);
    res.status(500).json({ error: "An error occurred while adding the movie. Please try again." });
  }
});




// Route to add a new theatre
router.post('/add-theatre', async (req, res) => {
  try {
    const theatreData = req.body;

    // Validate the request data if necessary
    const storedtheatreDetails = await adminHelper.addTheatre(theatreData)

    res.status(200).json({ message: 'Theatre added successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add the theatre. Please try again.', theatreId: storedtheatreDetails });
  }
});



router.get('/movies-list', async (req, res) => {
  try {
    const moviesDetails = await adminHelper.getMoviesList();
    res.status(200).json(moviesDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch movie details. Please try again.' });
  }
});



// Route to delete a movie
router.delete('/movie-delete/:id', async (req, res) => {
  try {
    const movieId = req.params.id;
    const deletedMovie = await adminHelper.deleteMovie(movieId)
    // Find the movie by ID and delete it

    if (!deletedMovie) {
      return res.status(204).json({ message: 'Movie not found' });
    }

    return res.status(200).json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    return res.status(500).json({ message: 'Failed to delete the movie. Please try again.' });
  }
});



// Route to get all theatres
router.get('/theatre-list', async (req, res) => {
  try {
    const theatres = await adminHelper.getTheatreList()
    console.log(theatres)
    res.status(200).json(theatres);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch theatres. Please try again.' });
  }
});




// POST route to add movie schedule
router.post('/add-movie-schedule', async (req, res) => {
  const { movie, theatre, showtime } = req.body;

  try {
    // Validate inputs
    if (!movie || !theatre || !showtime || !showtime.date || !showtime.time) {
      return res.status(400).json({ error: 'Movie, theatre, and showtime (including date and time) are required.' });
    }

    // Use helper function to add the schedule
    const addedSchedule = await adminHelper.addMovieSchedule(movie, theatre, showtime);
    if (addedSchedule.error) {
      return res.status(400).json({ error: addedSchedule.error });
    }

    res.status(201).json({ message: 'Movie scheduled successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to schedule the movie. Please try again.' });
  }
});





// Fetch schedule with movie and theatre details
router.get('/schedule-details', async (req, res) => {
  try {
    const schedules = await adminHelper.getSchedulesList();
    res.json(schedules);
  } catch (error) {
    console.error("Error fetching schedule details:", error);
    res.status(500).json({ error: 'Failed to fetch schedule details' });
  }
});



router.delete('/schedule/:scheduleId/showtime', async (req, res) => {
  const { scheduleId } = req.params;
  const { movieId, date, time } = req.body; // Expecting movieId, date, and time in the request body

  try {
    const result = await adminHelper.deleteShowtime(scheduleId, movieId, date, time); // Pass scheduleId, movieId, date, and time
    if (result.success) {
      return res.json({ message: result.message });
    } else {
      return res.json(result); // Return the updated schedule or other relevant info
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to delete showtime', error });
  }
});

module.exports = router;
