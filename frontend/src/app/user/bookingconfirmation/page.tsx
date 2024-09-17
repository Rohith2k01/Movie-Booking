"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import BookingConfirmation from "../../../components/Booking/Booking";
import styles from "../../../components/BookingConfirmation/BookingConfirmation.module.css";

interface UserDetails {
  userId: string;
  firstname: string; // Updated to match the expected prop names in BookingConfirmation
  lastname: string;
  email: string;
  phone: string;
}

const BookingConfirmationPage: React.FC = () => {
  const searchParams = useSearchParams();

  // State to hold user details
  const [userDetails, setUserDetails] = useState<UserDetails>({
    userId: "",
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
  });

  // Extracting booking-related data from URL search params
  const movieTitle = searchParams.get("movieTitle") || "";
  const theatreId = searchParams.get("theatreId") || "";
  const showDate = searchParams.get("showDate") || "";
  const showTime = searchParams.get("showTime") || "";
  const selectedSeats = JSON.parse(decodeURIComponent(searchParams.get("selectedSeats") || "[]"));
  const totalPrice = parseFloat(searchParams.get("totalPrice") || "0");

  // Fetching user details from localStorage
  useEffect(() => {
    const storedUserDetails = localStorage.getItem('userData');
    console.log("haiiiiiii", storedUserDetails)

    if (storedUserDetails) {
      const parsedDetails = JSON.parse(storedUserDetails);
      setUserDetails({
        userId: parsedDetails.userId || "",

        firstname: parsedDetails.firstname || "", // Updated to match BookingConfirmation expectations
        lastname: parsedDetails.lastname || "",
        email: parsedDetails.email || "",
        phone: parsedDetails.phone || "",
      });
    }
  }, []);

  return (
    <div className={styles.bookingConfirmationPage}>
      <BookingConfirmation

        userDetails={userDetails} // Now using details with correct property names
        movieTitle={movieTitle}
        theatreId={theatreId}
        showDate={showDate}
        showTime={showTime}
        selectedSeats={selectedSeats}
        totalPrice={totalPrice}
      />
      {/* Display additional info */}
    </div>
  );
};

export default BookingConfirmationPage;
