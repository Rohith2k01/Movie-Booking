"use client"

import React, { useState, useEffect } from "react";
import axios from "axios";
import OTPInput from "../../../components/Otp/Otp";
import styles from "../../../components/Otp/Otp.module.css";
import { getUser, isAuthenticated, User } from '../../../utils/auth';
import { useRouter } from 'next/navigation'; // Import useRouter
import PopUpVerification from '../../../components/Verification/Verification';


const EmailVerification: React.FC = () => {
  const router = useRouter(); // Initialize useRouter

  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
   // State to manage both initial and success popups
   const [showInitialPopup, setShowInitialPopup] = useState<boolean>(true); 
   const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);

   useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
   
    if (token) {
        localStorage.setItem('authToken', token);
    }
}, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated()) {
        const userData = await getUser();
        setUser(userData);
        if (userData?.email) {
          setEmail(userData.email);
        } else {
          setEmail("");
        }
      } else {
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  const getAuthToken = () => localStorage.getItem("authToken");

  const sendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/send-otp",
        { field: "email", value: email },
        { withCredentials: true }
      );
      if (response.data.message === "OTP sent successfully.") {
        setOtpSent(true);
        setCountdown(60);
        startCountdown();
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    if (otp.length !== 4) {
      setError("Please enter a valid 4-digit OTP.");
      return;
    }

    const token = getAuthToken();
    setError("");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        { field: "email", value: email, otp },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      if (response.data.verified) {
        setSuccess(true);
        setShowSuccessPopup(true); // Show success popup
                // Delay redirection by 5 seconds
                setTimeout(() => {
                  router.push('/');
                }, 5000);
        
      } else {
        setError("Incorrect OTP. Please try again.");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    }
  };

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) clearInterval(timer);
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className={styles.wrapper}>
       {/* Initial popup to ask for email verification */}
       {showInitialPopup && (
        <PopUpVerification
          onClose={() => setShowInitialPopup(false)}  // Close the popup
          onProceed={() => setShowInitialPopup(false)}  // Proceed button closes the popup
          verificationType="email"  // Set verification type to "email"
        />
      )}

      {/* Success popup after OTP verification */}
      {showSuccessPopup && (
        <PopUpVerification
          onClose={() => {
            setShowSuccessPopup(false);
            router.push('/'); // Redirect to home page after success popup closes
          }}
          onProceed={() => {
            setShowSuccessPopup(false);
            router.push('/'); // Redirect to home page after success popup closes
          }}
          success
          verificationType="email"  // Set verification type to "email"
        />
      )}

      <div className={styles.container}>
        <h1 className={styles.title}>Email Verification</h1>
        {user ? (
          <>
            <div className={styles.inputFieldWrapper}>
              <input
                type="email"
                value={email}
                readOnly
                className={styles.inputField}
                placeholder="Email"
              />
              <img
                src={user.photo || "/default-photo.png"}
                alt="Profile Icon"
                className={styles.profileIcon}
              />
            </div>
            <div className={styles.secondMaindiv}>
            {!loading && (
              <button
                onClick={sendOtp}
                disabled={countdown > 0} // Disable button after OTP sent
                className={`${styles.sendButton} ${otpSent ? styles.activeSendButton : ""}`}
              >
                {countdown > 0 ? `Resend OTP (${countdown})` : "Send OTP"}
              </button>
            )}
            {loading && (
              <div className={styles.spinnerDiv}>
                <div className={styles.loadingSpinner}></div>
              </div>
            )}
              <OTPInput length={4} onChange={setOtp} />
              <button
                onClick={verifyOtp}
                disabled={!otpSent}
                className={styles.verifyButton}
              >
                Verify OTP
              </button>
              {!otpSent ? (
                <span className={styles.tooltip}>sent Otp to Email for enable the button</span>
              ) : null}
              {error && <p className={styles.errorMessage}>{error}</p>}
              {success && <p className={styles.successMessage}>{success}</p>}
            </div>
          </>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
