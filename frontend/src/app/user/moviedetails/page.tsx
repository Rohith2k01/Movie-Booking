"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./movieDetails.module.css";
import { useSearchParams, useRouter } from "next/navigation";

// Define TypeScript interfaces
interface Movie {
  _id: string;
  title: string;
  description: string;
  duration: string;
  genre: string;
  certification: string;
  releaseDate: string;
  image: string; // Movie poster
  imdbRating: string;
  language: string;
  director: string;
  cast: string[]; // Array of cast members
  backgroundPoster?: string; // Optional background poster
}

interface Showtime {
  date: string;
  times: string[];
}

interface Schedule {
  movie: Movie;
  showtimes: Showtime[];
}

const MovieDetails: React.FC = () => {
  const searchParams = useSearchParams();
  const movieId = searchParams.get("movieId");
  const router = useRouter();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (movieId) {
        try {
          const response = await axios.get(`http://localhost:8080/api/movie-details/${movieId}`);
          setSchedule(response.data);
        } catch (error) {
          setErrorMessage("Failed to fetch movie details.");
        }
      } else {
        setErrorMessage("Movie ID is missing in query parameters.");
      }
    };

    fetchMovieDetails();
  }, [movieId]);


  const handleBookTickets = () => {
    router.push(`/user/book-tickets?movieId=${movieId}`);
  };

  if (errorMessage) return <p>{errorMessage}</p>;
  if (!schedule) return <p>Loading...</p>;

  const backgroundPoster = schedule.movie.backgroundPoster || schedule.movie.image; // Default background image

  return (
    <div
      className={styles.detailsSection}

    >
      <div className={styles.movieInfoContainer} style={{ backgroundImage: `url(${backgroundPoster})` }}>
        <img src={schedule.movie.image || '/path/to/dummy-poster.jpg'} alt={schedule.movie.title} className={styles.movieImage} />
        <div className={styles.movieInfo}>
          <h2>{schedule.movie.title}</h2>
          <div className={styles.ratingBox}>
            <span>⭐ {schedule.movie.imdbRating}/10</span>
            <span> - {schedule.movie.language}</span>
            <button className={styles.rateNow}>Rate Now</button>
          </div>
          <p>{schedule.movie.duration} - {schedule.movie.genre} - {schedule.movie.certification}</p>
          <p>Release Date: {new Date(schedule.movie.releaseDate).toLocaleDateString()}</p>
          <button className={styles.bookButton} onClick={handleBookTickets}>
            Book tickets
          </button>
        </div>
      </div>

      <div className={styles.aboutSection}>
        <h3>About the movie</h3>
        <p>{schedule.movie.description}</p>
      </div>

      <div className={styles.castCrewSection}>
        <h3>Cast</h3>
        <div className={styles.castList}>
          {schedule.movie.cast.map((actor, index) => (
            <div key={index} className={styles.castMember}>
              <img src={!actor ? `/images/actors/${actor}.jpg` : '/profile.svg'} alt={actor} className={styles.actorImage} />
              <p>{actor}</p>
            </div>
          ))}
        </div>

        <h3>Crew</h3>
        <div className={styles.crewList}>
          <div className={styles.crewMember}>
            <img src="/profile.svg" alt={schedule.movie.director} className={styles.crewImage} />
            <p>{schedule.movie.director} - Director</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
