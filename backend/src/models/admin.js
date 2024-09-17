const mongoose = require("mongoose");


const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: String, required: true },
  genre: { type: String, required: true },
  certification: { type: String, required: true },
  releaseDate: { type: Date, required: true },
  image: { type: String, required: true },
  director: { type: String, required: false }, // Add director
  cast: { type: [String], required: false }, // Add cast (actors)
  imdbRating: { type: String, required: false }, // Add IMDb rating
  language: { type: String, required: false } // Add language
});
const Movie = mongoose.model("Movies", movieSchema);

const theatreSchema = new mongoose.Schema({
  theatreName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  screenResolution: {
    type: String,
    enum: ['2K', '4K'],
    default: '2K',
  },
  amenities: {
    type: [String],
    default: [],
  },
  capacity: {
    type: Number,
    required: true
  }
}, { timestamps: true });

const Theatre = mongoose.model('Theatre', theatreSchema);

const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true }, // e.g., "A1", "B3"
  isBooked: { type: Boolean, default: false },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { _id: false });

const showtimeSchema = new mongoose.Schema({
  date: { type: String, required: true },
  times: [{
    time: { type: String, required: true }, // Store time as string
    seats: [seatSchema] // Each time has its own seats array
  }]
});
// Define the schema for movie schedules
const scheduleSchema = new mongoose.Schema({
  theatre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theatre',
    required: true
  },
  movies: [{
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movies',
      required: true
    },
    showDates: [showtimeSchema] // Group showtimes by date for each movie
  }]
}, { timestamps: true });



const movieSchedule = mongoose.model('Schedule', scheduleSchema);

module.exports = { Movie, Theatre, movieSchedule };
