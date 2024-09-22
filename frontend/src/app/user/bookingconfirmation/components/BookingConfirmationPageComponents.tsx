"use client"; // Ensure client-side rendering

import React, { useEffect, useState ,Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BookingConfirmation from "../../../../components/Booking/Booking";
import styles from "../../../../components/Booking/Booking.module.css";

interface UserDetails {
  userId: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
}

const BookingConfirmationPageComponent: React.FC = () => {
  const searchParams = useSearchParams();

  const [userDetails, setUserDetails] = useState<UserDetails>({
    userId: "",
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
  });

  const movieTitle = searchParams.get("movieTitle") || "Unknown";
  const theatreId = searchParams.get("theatreId") || "Unknown";
  const showDate = searchParams.get("showDate") || "Unknown";
  const showTime = searchParams.get("showTime") || "Unknown";
  const selectedSeats = JSON.parse(decodeURIComponent(searchParams.get("selectedSeats") || "[]"));
  const totalPrice = parseFloat(searchParams.get("totalPrice") || "0");

  useEffect(() => {
    try {
      const storedUserDetails = localStorage.getItem('userData');
      if (storedUserDetails) {
        const parsedDetails = JSON.parse(storedUserDetails);
        setUserDetails({
          userId: parsedDetails._id || "",
          firstname: parsedDetails.firstname || "",
          lastname: parsedDetails.lastname || "",
          email: parsedDetails.email || "",
          phone: parsedDetails.phone || "",
        });
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage', error);
    }
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div className={styles.bookingConfirmationPage}>
      <BookingConfirmation
        userDetails={userDetails}
        movieTitle={movieTitle}
        theatreId={theatreId}
        showDate={showDate}
        showTime={showTime}
        selectedSeats={selectedSeats}
        totalPrice={totalPrice}
      />
    </div>
    </Suspense>
  );
};

export default BookingConfirmationPageComponent;