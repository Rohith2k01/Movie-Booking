"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import styles from '../../../styles/admin/moviesList.module.css';

interface Movie {
    _id: string;
    title: string;
    description: string;
    duration: string;
    genre: string;
    certification: string;
    releaseDate: string;
    image: string;
}

const MovieList: React.FC = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const router = useRouter();

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/admin/movies-list');
                setMovies(response.data);
            } catch (error) {
                setErrorMessage('Failed to fetch movies. Please try again later.');
            }
        };
        fetchMovies();
    }, []);

    const handleDelete = async (movieId: string) => {
        try {
            await axios.delete(`http://localhost:8080/api/admin/movie-delete/${movieId}`);
            setMovies(movies.filter((movie) => movie._id !== movieId));
        } catch (error) {
            setErrorMessage('Failed to delete the movie. Please try again.');
        }
    };

    return (
        <section className={styles.mainSection}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Movie List</h2>
                    <button className={styles.addButton} onClick={() =>  router.push('/admin/Movies')}>Add Movie</button>
                </div>
                {errorMessage && <div className={styles.error}>{errorMessage}</div>}
                {movies.length > 0 ? (
                    <div className={styles.movieTable}>
                        {movies.map((movie, index) => (
                            
                            <div key={movie._id} className={styles.movieCard}>
                                <span className={styles.movieIndex}>{index + 1}</span>          
                                <img src={movie.image} alt={movie.title} className={styles.movieImage} />
                                <div className={styles.movieContent}>
                                    <div className={styles.movieHeader}>
                                        <span className={styles.movieTitle}>{movie.title}</span>
                                        <div className={styles.movieDetails}>
                                            <span className={styles.movieDetail}>{movie.genre}</span>
                                            <span className={styles.movieDetail}>{movie.duration}</span>
                                            <span className={styles.movieDetail}>{new Date(movie.releaseDate).toLocaleDateString()}</span>
                                            <span className={styles.movieDetail}>{movie.certification}</span>
                                        </div>
                                    </div>
                                    <div className={styles.movieDescription}>
                                        {movie.description}

                                        
                                    </div>
                                    
                                </div>
                                <div className={styles.movieActions}>
                                        <button onClick={() => handleDelete(movie._id)} className={styles.deleteButton}>
                                            Delete
                                        </button>
                                        <button className={styles.editButton}>Edit</button>
                                    </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <h3 className={styles.emptyMessage}>No movies available</h3>
                )}
            </div>
        </section>
    )
};

export default MovieList;
