"use client"

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../../../styles/admin/movieSchedule.module.css'; // Import the CSS file

interface Movie {
  _id: string;
  title: string;
}

interface Theatre {
  _id: string;
  theatreName: string;
}

interface Showtime {
  date: string;
  time: string;
}

const predefinedShowtimes = [
  "06:30",
  "10:00",
  "13:30" ,
  "16:00",
  "19:30",
  "23:00",
];

const ScheduleMovie: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<string>('');
  const [selectedTheatre, setSelectedTheatre] = useState<string>('');
  const [showtime, setShowtime] = useState<Showtime>({ date: '', time: '' });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    // Fetch movies and theatres
    const fetchData = async () => {
      try {
        const [moviesResponse, theatresResponse] = await Promise.all([
          axios.get('http://localhost:8080/api/admin/movies-list'),
          axios.get('http://localhost:8080/api/admin/theatre-list')
        ]);
        setMovies(moviesResponse.data);
        setTheatres(theatresResponse.data);
      } catch (error) {
        setErrorMessage('Failed to fetch movies or theatres.');
      }
    };
    fetchData();
  }, []);

  const handleShowtimeChange = (field: keyof Showtime, value: string) => {
    setShowtime(prevShowtime => ({
      ...prevShowtime,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!showtime.date || !showtime.time) {
      setErrorMessage('Showtime must include both date and time.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/admin/add-movie-schedule', {
        movie: selectedMovie,
        theatre: selectedTheatre,
        showtime
      });

      setSuccessMessage(response.data.message);
    } catch (error: any) {
      const errorResponse = error.response?.data?.error;
      if (errorResponse) {
        setErrorMessage(errorResponse);
      } else {
        setErrorMessage('Failed to schedule the movie. Please try again.');
      }
    }
  };  
               
  return (
    <div className={styles.mainSection}>
      <div className={styles.container}>
        <h2>Schedule Movie</h2>
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
        {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

        <div className={styles.movieFormWrapper}>
          <form className={styles.movieForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Movie:</label>
              <select
                className={styles.selectField}
                value={selectedMovie}
                onChange={(e) => setSelectedMovie(e.target.value)}
              >
                <option value="">Select a movie</option>
                {movies.map((movie) => (
                  <option key={movie._id} value={movie._id}>
                    {movie.title}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Theatre:</label>
              <select
                className={styles.selectField}
                value={selectedTheatre}
                onChange={(e) => setSelectedTheatre(e.target.value)}
              >
                <option value="">Select a theatre</option>
                {theatres.map((theatre) => (
                  <option key={theatre._id} value={theatre._id}>
                    {theatre.theatreName}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Date:</label>
              <input
                className={styles.inputField}
                type="date"
                value={showtime.date}
                onChange={(e) => handleShowtimeChange('date', e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Time:</label>
              <select
                className={styles.selectField}
                value={showtime.time}
                onChange={(e) => handleShowtimeChange('time', e.target.value)}
              >
                <option value="">Select a time</option>
                {predefinedShowtimes.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className={styles.submitButton}>
              Schedule Movie
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleMovie;
