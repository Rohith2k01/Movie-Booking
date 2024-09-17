"use client"; // This allows the use of client-side hooks like useState and useEffect

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./Seats.module.css"; // Import the CSS module

interface Seat {
  seatNumber: string;
  isBooked: boolean;
}

const SeatsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const movieId = searchParams.get("movieId");
  const theatreId = searchParams.get("theatreId");
  const showDate = searchParams.get("showDate");
  const showTime = searchParams.get("showTime");

  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [movieTitle, setMovieTitle] = useState<string>("N/A");
  const [price, setPrice] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const fetchSeats = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8080/api/seats", {
          params: { movieId, theatreId, showDate, showTime },
        });
        setSeats(response.data.seats);
        setMovieTitle(response.data.movieTitle);
        setPrice(response.data.price || 150);
        setError("");
      } catch (error) {
        setError("Failed to fetch seat details.");
      } finally {
        setLoading(false);
      }
    };

    if (movieId && theatreId && showDate && showTime) {
      fetchSeats();
    }
  }, [movieId, theatreId, showDate, showTime]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.isBooked) {
      alert("This seat is already booked.");
      return;
    }

    setSelectedSeats((prevSelectedSeats) =>
      prevSelectedSeats.includes(seat.seatNumber)
        ? prevSelectedSeats.filter((s) => s !== seat.seatNumber)
        : [...prevSelectedSeats, seat.seatNumber]
    );
  };

  const totalPrice = selectedSeats.length * price;

  const handlePayClick = () => {
    const userDetails = { userId: "123", phone: "9876543210" }; // Mock user details

    const queryParams = new URLSearchParams({
      userId: userDetails.userId,
      userDetails: JSON.stringify(userDetails),
      movieTitle,
      theatreId: theatreId || "",
      showDate: showDate || "",
      showTime: showTime || "",
      selectedSeats: JSON.stringify(selectedSeats),
      totalPrice: totalPrice.toString(),
    }).toString();

    router.push(`/user/booking-confirmation?${queryParams}`);
  };

  return (
    <div className={styles.seatsWrapper}>
      {loading ? (
        <p className={styles.loading}>Loading seats...</p>
      ) : (
        <>
          <div className={styles.seatsHeadingDiv}>
            <h2 className={styles.title}>{movieTitle}</h2>
            <p className={styles.details}>
              {theatreId} | <span>{showDate} | {showTime}</span>
            </p>

            {error && <p className={styles.error}>{error}</p>}
          </div>

          <div className={styles.seatsContainer}>
            {seats.map((seat) => (
              <div
                key={seat.seatNumber}
                className={`${styles.seat} ${seat.isBooked
                    ? styles.booked
                    : selectedSeats.includes(seat.seatNumber)
                      ? styles.selected
                      : styles.available
                  }`}
                onClick={() => handleSeatClick(seat)}
              >
                {seat.seatNumber}
              </div>
            ))}
          </div>

          {selectedSeats.length > 0 && (
            <div className={styles.paymentSection}>
              <p className={styles.totalPrice}>
                Total Price: Rs. {totalPrice}
              </p>
              <button className={styles.payButton} onClick={handlePayClick}>
                Pay Rs. {totalPrice}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SeatsPage;
