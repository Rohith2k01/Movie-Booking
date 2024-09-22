"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../../components/Movies/Movies.module.css"; // Import your CSS file
import styles2 from './movielist.module.css'
import { useRouter } from 'next/navigation';

interface Movie {
  _id: string;
  title: string;
  description: string;
  duration: string;
  genre: string; // Genre as a comma-separated string
  certification: string;
  releaseDate: string;
  image: string;
  language: string; // Comma-separated string for languages
}

const MovieDisplay: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Fetch movies
    const fetchMovies = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/all-movies");
        const moviesData: Movie[] = response.data;
        setMovies(moviesData);
        setFilteredMovies(moviesData);

        // Extract unique languages from the fetched movies
        const allLanguages = moviesData
          .flatMap(movie => movie.language.split(',').map(lang => lang.trim()))
          .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
        setAvailableLanguages(allLanguages);
      } catch (error) {
      }
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    // Filter movies based on selected genre and language
    let filtered = [...movies];

    if (selectedGenre !== "") {
      filtered = filtered.filter(movie => {
        const genres = movie.genre.split(',').map(genre => genre.trim());
        return genres.includes(selectedGenre);
      });
    }

    if (selectedLanguage !== "") {
      filtered = filtered.filter(movie => {
        const languages = movie.language.split(',').map(language => language.trim());
        return languages.includes(selectedLanguage);
      });
    }

    setFilteredMovies(filtered);
  }, [selectedGenre, selectedLanguage, movies]);

  // Handle genre filter change
  const handleGenreChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGenre(event.target.value);
  };

  // Handle language filter change
  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(event.target.value);
  };

  const handleCardClick = (movieId: string) => {
    router.push(`/user/moviedetails?movieId=${movieId}`); // Redirect to movie details page with query parameter
  };

  return (
    <div className={styles2.mainSection}>
      <h2>Movies</h2>
      <div className={styles.container}>
        <div className={styles.filterMainDiv}>
         
            <div className={styles.filterSection}>
              <h3>Filter by</h3>
              <div className={styles.filterRow}>
                <div className={styles.filterItem}>
                  <label htmlFor="genreFilter">Genre:</label>
                  <select id="genreFilter" value={selectedGenre} onChange={handleGenreChange}>
                    <option value="">All Genres</option>
                    <option value="Action">Action</option>
                    <option value="Drama">Drama</option>
                    <option value="Horror">Horror</option>
                    <option value="Romance">Romance</option>
                    {/* Add more genres as needed */}
                  </select>
                </div>
                <div className={styles.filterItem}>
                  <label htmlFor="languageFilter">Language:</label>
                  <select id="languageFilter" value={selectedLanguage} onChange={handleLanguageChange}>
                    <option value="">All Languages</option>
                    {availableLanguages.map((language, index) => (
                      <option key={index} value={language}>
                        {language}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
         
        </div>

        <div className={styles.moviesCardDiv}>
          <div className={styles.cardContainer}>
            {filteredMovies.length > 0 ? (
              filteredMovies.map((movie) => (
                <div
                  key={movie._id}
                  className={styles.scheduleCard}
                  onClick={() => handleCardClick(movie._id)}
                >
                  <img src={movie.image} alt={movie.title} className={styles.movieImage} />
                  <div className={styles.scheduleDetails}>
                    <h4 className={styles.movieTitle}>{movie.title}</h4>
                    <p className={styles.movieInfo}>Duration: {movie.duration}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.emptyMessage}>No movies available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDisplay;