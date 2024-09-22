"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import styles from "./SeatSelection.module.css"; // Import the CSS module

interface Seat {
  seatNumber: string;
  isBooked: boolean;
}

interface SeatsProps {
  movieId: string;
  theatreId: string;
  showDate: string;
  showTime: string;
}

const Seats: React.FC<SeatsProps> = ({ movieId, theatreId, showDate, showTime }) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]); // To track selected seats
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [movieTitle, setMovieTitle] = useState<string>("N/A"); // To track the movie title
  const [price, setPrice] = useState<number>(0); // To track price
  const router = useRouter(); // Initialize router

  // Handle page refresh and back button navigation
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (selectedSeats.length > 0) {
        event.preventDefault();
        event.returnValue = ""; // Display the confirmation dialog when refreshing
      }
    };

    // Add the beforeunload event listener for page refresh or closing the tab
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [selectedSeats]);

  useEffect(() => {
    const fetchSeats = async () => {
      setLoading(true); // Set loading to true when fetching data
      try {
        const response = await axios.get("http://localhost:8080/api/seats", {
          params: {
            movieId,
            theatreId,
            showDate,
            showTime,
          },
        });
        setSeats(response.data.seats);
        setMovieTitle(response.data.movieTitle); // Get movie title from backend
        setPrice(response.data.price || 150); // Get price dynamically from backend or use default value
        setError(""); // Clear any previous errors
      } catch (error) {
        setError("Failed to fetch seat details.");
      } finally {
        setLoading(false); // Stop loading after fetching data
      }
    };

    fetchSeats();
  }, [movieId, theatreId, showDate, showTime]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.isBooked) {
      alert("This seat is already booked.");
      return;
    }

    // Toggle seat selection
    setSelectedSeats(prevSelectedSeats =>
      prevSelectedSeats.includes(seat.seatNumber)
        ? prevSelectedSeats.filter(s => s !== seat.seatNumber)
        : [...prevSelectedSeats, seat.seatNumber]
    );
  };

  // Calculate total price based on selected seats
  const totalPrice = selectedSeats.length * price;

  // Handle Pay button click to redirect to the booking confirmation page
  const handlePayClick = () => {
    const userDetails = { userId: "123", phone: "" }; // Mock user details

    // Create URL with query parameters
    const queryParams = new URLSearchParams({
      userId: userDetails.userId,
      userDetails: JSON.stringify(userDetails),
      movieTitle,
      theatreId,
      showDate,
      showTime,
      selectedSeats: JSON.stringify(selectedSeats),
      totalPrice: totalPrice.toString(),
    }).toString();

    // Redirect to the booking confirmation page with query parameters
    router.push(`/user/bookingconfirmation?${queryParams}`);
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
          {/* Screen Div */}
          <div className={styles.screen}>
            <p className={styles.screenLabel}>SCREEN</p>
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

export default Seats;
