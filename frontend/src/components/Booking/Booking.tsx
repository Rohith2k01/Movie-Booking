"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Booking.module.css";

interface BookingConfirmationProps {
  userDetails: {
    userId: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
  };
  movieTitle: string;
  theatreId: string;
  showDate: string;
  showTime: string;
  selectedSeats: string[];
  totalPrice: number;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  userDetails,
  movieTitle,
  theatreId,
  showDate,
  showTime,
  selectedSeats,
  totalPrice,
}) => {
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [phone, setPhone] = useState(userDetails.phone || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false); // To track phone verification status

  useEffect(() => {
    const loadRazorpayScript = async () => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => console.error("Failed to load Razorpay SDK.");
      document.body.appendChild(script);
    };
    loadRazorpayScript();
  }, []);

  const handleRazorpayPayment = async () => {
    if (!razorpayLoaded) return alert("Razorpay SDK is not loaded.");
    if (!phoneVerified) return alert("Please verify your phone number before proceeding.");

    try {
      const response = await axios.post("http://localhost:8080/api/razorpay-order", { amount: totalPrice * 100 });
      const { data } = response;
      if (!data.success) return alert("Error initiating payment.");

      const rzp = new (window as any).Razorpay({
        key: "rzp_test_37TZNY8cnWgUm8",
        amount: data.amount,
        currency: data.currency,
        name: "Movie Booking",
        description: "Payment for movie booking",
        order_id: data.order_id,
        handler: (response: any) => {
          alert("Payment successful!");
          confirmBooking(response.razorpay_payment_id);
        },
        prefill: {
          name: `${userDetails.firstname} ${userDetails.lastname}`,
          email: userDetails.email,
        },
        theme: { color: "#f12f3f" },
      });
      rzp.open();
    } catch (error) {
      console.error("Error initiating payment", error);
      alert("Issue with initiating payment.");
    }
  };

  const confirmBooking = async (paymentId: string) => {
    try {
      const response = await axios.post("http://localhost:8080/api/confirm-booking", {
        userDetails: {
          ...userDetails,
          phone,
        },
        movieTitle,
        theatreId,
        showDate,
        showTime,
        selectedSeats,
        totalPrice,
        paymentId,
      });
      if (response.data.success) alert("Booking confirmed!");
      else alert("Error confirming booking.");
    } catch (error) {
      console.error("Error confirming booking", error);
      alert("Issue confirming booking.");
    }
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(event.target.value);
  };

  const sendOtp = async () => {
    setOtpError("");
    setLoading(true); // Start loading
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/send-otp",
        {
          field: "phone",
          value: phone,
        },
        { withCredentials: true }
      );
      if (response.data.message === "OTP sent successfully.") {
        setOtpSent(true);
      } else {
        setOtpError("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setOtpError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false); // End loading
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 4) {
      setOtpError("Please enter a valid 4-digit OTP.");
      return;
    }

    setLoading(true); // Start loading
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/verify-otp",
        {
          field: "phone",
          value: phone,
          otp,
          userId: userDetails.userId,
        },
        { withCredentials: true }
      );
      if (response.data.verified) {
        alert("Phone number verified successfully!");
        setOtpSent(false);
        setPhoneVerified(true); // Set phone as verified
      } else {
        setOtpError("Incorrect OTP. Please try again.");
      }
    } catch (error) {
      setOtpError("Verification failed. Please try again.");
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className={styles.bookingConfirmation}>
      <h2>Booking Confirmation</h2>
      <div className={styles.details}>
        <h3>User Details</h3>
        <p>Name: {userDetails.firstname} {userDetails.lastname}</p>
        <p>Email: {userDetails.email}</p>

        <h3>Booking Details</h3>
        <p>Movie: {movieTitle}</p>
        <p>Theatre: {theatreId}</p>
        <p>Date: {showDate}</p>
        <p>Time: {showTime}</p>
        <p>Seats: {selectedSeats.join(", ")}</p>
        <p>Total Price: ₹{totalPrice}</p>

        <div className={styles.phoneSection}>
          <p>
            Add your Phone number to receive a booking receipt:
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              className={styles.phoneInput}
              placeholder="Enter your phone number"
              disabled={phoneVerified} // Disable input after verification
            />
            {!phoneVerified ? (
              <button
                onClick={sendOtp}
                className={styles.verifyButton}
                disabled={loading}
              >
                {loading ? "Sending..." : "Verify"}
              </button>
            ) : (
              <span className={styles.verifiedText}>Verified</span> // Show Verified text
            )}
          </p>
          {otpSent && !phoneVerified && (
            <div className={styles.otpSection}>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={styles.otpInput}
                placeholder="Enter OTP"
              />
              <button
                onClick={verifyOtp}
                className={styles.verifyButton}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          )}
          {otpError && <p className={styles.errorMessage}>{otpError}</p>}
        </div>
      </div>
      <button
        onClick={handleRazorpayPayment}
        className={styles.confirmButton}
        disabled={!phoneVerified} // Disable the button if the phone is not verified
      >
        Confirm Booking
      </button>
    </div>
  );
};

export default BookingConfirmation;
