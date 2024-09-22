// src/pages/booking-details/page.tsx

"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './bookingdetails.module.css'; // Importing the CSS module

interface Booking {
    movie: string;
    theatre: string;
    date: string;
    time: string;
    seats: string[];
    totalPrice: number;
    paymentId: string;
}

interface GroupedBookings {
    [movie: string]: Booking[];
}

const BookingDetails = () => {
    const [bookingData, setBookingData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const [expandedMovies, setExpandedMovies] = useState<string[]>([]); // State to track expanded movies

    useEffect(() => {
        // Retrieve userId from localStorage
        const storedUserDetails = localStorage.getItem('userData');
        if (storedUserDetails) {
            const userDetails = JSON.parse(storedUserDetails);
            setUserId(userDetails._id); // Assuming the user ID is saved in 'userId' field

        }
    }, []);

    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (userId) {
                try {
                    const response = await axios.get(`http://localhost:8080/api/booking-details/${userId}`);
                    setBookingData(response.data);
                    setLoading(false);
                } catch (err) {
                    setError('Error fetching booking details');
                    setLoading(false);
                }
            }
        };

        if (userId) {
            fetchBookingDetails();
        }
    }, [userId]);

    // Function to group bookings by movie name
    const groupBookingsByMovie = (bookings: Booking[]): GroupedBookings => {
        return bookings.reduce((grouped: GroupedBookings, booking: Booking) => {
            if (!grouped[booking.movie]) {
                grouped[booking.movie] = [];
            }
            grouped[booking.movie].push(booking);
            return grouped;
        }, {});
    };

    // Function to toggle movie details visibility
    const toggleMovieDetails = (movie: string) => {
        if (expandedMovies.includes(movie)) {
            setExpandedMovies(expandedMovies.filter((m) => m !== movie));
        } else {
            setExpandedMovies([...expandedMovies, movie]);
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.errorMessage}>{error}</div>;

    const groupedBookings = bookingData ? groupBookingsByMovie(bookingData.bookings) : {};

    return (
        <div className={styles.bookingDetailsContainer}>
            <h1 className={styles.mainHeader}>Booking Details</h1>
            {bookingData ? (
                <div className={styles.bookingCard}>
                    <div className={styles.userInfo}>
                        <h2>{`${bookingData.user.firstname} ${bookingData.user.lastname}`}</h2>
                        <p>Email: {bookingData.user.email}</p>
                        <p>Phone: {bookingData.user.phone}</p>
                    </div>

                    <div className={styles.bookingInfo}>
                        {Object.keys(groupedBookings).map((movie, index) => (
                            <div key={index} className={styles.movieGroup}>
                                {/* Movie name clickable to toggle details */}
                                <h3 onClick={() => toggleMovieDetails(movie)} className={styles.movieTitle}>
                                    {movie}
                                </h3>

                                {/* Conditional rendering of movie details */}
                                {expandedMovies.includes(movie) && (
                                    <div className={styles.movieDetails}>
                                        {groupedBookings[movie].map((booking, i) => (
                                            <div key={i} className={styles.bookingItem}>
                                                <p>Theatre<p>:</p> <span>{booking.theatre}</span></p>
                                                <p>Date<p>:</p><span>{booking.date}</span></p>
                                                <p>Time<p>:</p> <span>{booking.time}</span></p>
                                                <p>Seats<p>:</p> <span>{booking.seats.join(', ')}</span></p>
                                                <p>Total Price<p>:</p> <span>₹{booking.totalPrice}</span></p>

                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p>No booking details available.</p>
            )}
        </div>
    );
};

export default BookingDetails;