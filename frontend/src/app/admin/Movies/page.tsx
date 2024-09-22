"use client"

import React, { useState } from "react";
import axios from "axios";
import styles from '../../../styles/admin/Movies.module.css';
import { useRouter } from "next/navigation";

const AddMovies: React.FC = () => {
  const [movieData, setMovieData] = useState({
    title: "",
    description: "",
    duration: "",
    genre: "",
    certification: "",
    releaseDate: "",
    imageUrl: "",
    director: "",         // New field
    cast: "",             // New field
    imdbRating: "",       // New field
    language: "",         // New field
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [searchYear, setSearchYear] = useState("");

  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMovieData({ ...movieData, [name]: value });
  };

  const handleSearch = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axios.get(`http://localhost:8080/api/admin/movies-lookup`, {
        params: {
          title: searchTitle,
          year: searchYear
        }
      });

      if (response.data) {
        const movie = response.data;
        setMovieData({
          title: movie.Title,
          description: movie.Plot,
          duration: movie.Runtime,
          genre: movie.Genre,
          certification: movie.Rated,
          releaseDate: formatReleaseDate(movie.Released),
          imageUrl: movie.Poster,
          director: movie.Director,        // New field
          cast: movie.Actors,             // New field
          imdbRating: movie.imdbRating,   // New field
          language: movie.Language        // New field
        });
        setSuccessMessage("Movie details fetched successfully.");
      } else {
        setErrorMessage("Movie not found.");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.error || "Failed to fetch movie details. Please try again."
        );
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  const formatReleaseDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const formData = {
      title: movieData.title,
      description: movieData.description,
      duration: movieData.duration,
      genre: movieData.genre,
      certification: movieData.certification,
      releaseDate: movieData.releaseDate,
      imageUrl: movieData.imageUrl,
      director: movieData.director,        // New field
      cast: movieData.cast,              // New field
      imdbRating: movieData.imdbRating,  // New field
      language: movieData.language       // New field
    };

    try {
      const response = await axios.post("http://localhost:8080/api/admin/add-movies", formData);

      if (response.status === 200) {
        setSuccessMessage("Movie added successfully!");
        setMovieData({
          title: "",
          description: "",
          duration: "",
          genre: "",
          certification: "",
          releaseDate: "",
          imageUrl: "",
          director: "",         // New field
          cast: "",             // New field
          imdbRating: "",       // New field
          language: "",         // New field
        });
        setSelectedImage(null);
        setTimeout(() => {
          router.push("/admin/movieslist");
        }, 1000); // Adjust the timeout as needed
      }
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.error || "Failed to add the movie. Please try again."
        );
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className={styles.mainSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Add a New Movie</h2>
        </div>
        {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
        {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}

        <div className={styles.inputGroup}>
          <div className={styles.searchInputWithButton}>
            <input
              type="text"
              placeholder="Movie Title"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className={styles.inputField}
            />
            <input
              type="text"
              placeholder="Year"
              value={searchYear}
              onChange={(e) => setSearchYear(e.target.value)}
              className={styles.inputField}
            />
            <button type="button" onClick={handleSearch} className={styles.addButton}>
              Search
            </button>
          </div>
        </div>

        {movieData.imageUrl && (
          <form onSubmit={handleSubmit} className={styles.movieForm}>
            <div className={styles.formGroup}>
              <input
                type="text"
                id="title"
                name="title"
                value={movieData.title}
                onChange={handleChange}
                required
                className={styles.inputFieldTitle}
                placeholder="Title"
              />
              <textarea
                id="description"
                name="description"
                value={movieData.description}
                onChange={handleChange}
                required
                className={styles.inputField}
                placeholder="Description"
              />


            </div>
            <div className={styles.imageGroup}>

              <div className={styles.imagePreview}>
                <img src={movieData.imageUrl} alt="Movie Poster" className={styles.moviePoster} />
                <div className={styles.detailsRightImageDiv}>


                  <table className={styles.formTable}>
                    <tbody>

                      <tr style={{ display: 'none' }}>
                        <th>Description</th>
                        <td>
                          <input
                            type="text"
                            id="imageUrl"
                            name="imageUrl"
                            value={movieData.imageUrl}
                            onChange={handleChange}
                            required
                            className={styles.inputField}

                          />
                        </td>
                      </tr>
                      <tr>
                        <th>Duration</th>
                        <td>
                          <input
                            type="text"
                            id="duration"
                            name="duration"
                            value={movieData.duration}
                            onChange={handleChange}
                            required
                            className={styles.inputField}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>Genre</th>
                        <td>
                          <input
                            type="text"
                            id="genre"
                            name="genre"
                            value={movieData.genre}
                            onChange={handleChange}
                            required
                            className={styles.inputField}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>Certification</th>
                        <td>
                          <input
                            type="text"
                            id="certification"
                            name="certification"
                            value={movieData.certification}
                            onChange={handleChange}
                            required
                            className={styles.inputField}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>Release Date</th>
                        <td>
                          <input
                            type="date"
                            id="releaseDate"
                            name="releaseDate"
                            value={movieData.releaseDate}
                            onChange={handleChange}
                            required
                            className={styles.inputField}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>Director</th>        {/* New field */}
                        <td>
                          <input
                            type="text"
                            id="director"
                            name="director"
                            value={movieData.director}
                            onChange={handleChange}
                            required
                            className={styles.inputField}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>Cast</th>            {/* New field */}
                        <td>
                          <input
                            type="text"
                            id="cast"
                            name="cast"
                            value={movieData.cast}
                            onChange={handleChange}
                            required
                            className={styles.inputField}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>IMDb Rating</th>    {/* New field */}
                        <td>
                          <input
                            type="text"
                            id="imdbRating"
                            name="imdbRating"
                            value={movieData.imdbRating}
                            onChange={handleChange}
                            required
                            className={styles.inputField}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>Language</th>      {/* New field */}
                        <td>
                          <input
                            type="text"
                            id="language"
                            name="language"
                            value={movieData.language}
                            onChange={handleChange}
                            required
                            className={styles.inputField}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <button type="submit" className={styles.submitButton}>Add Movie</button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddMovies;
