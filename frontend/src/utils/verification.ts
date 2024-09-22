// utils/auth.ts

import axios from "axios";

// Send OTP to the phone number
export const sendOtp = async (phone: string) => {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/auth/send-otp",
      { field: "phone", value: phone },
      { withCredentials: true }
    );
    if (response.data.message === "OTP sent successfully.") {
      return { success: true };
    } else {
      return { success: false, error: "Failed to send OTP. Please try again." };
    }
  } catch (error) {
    return { success: false, error: "Failed to send OTP. Please try again." };
  }
};

// Verify OTP for the phone number
export const verifyOtp = async (
  phone: string,
  otp: string,
  userId: string
) => {
  try {
    const response = await axios.post(
      "http://localhost:8080/api/auth/verify-otp",
      {
        field: "phone",
        value: phone,
        otp,
        userId,
      },
      { withCredentials: true }
    );

    if (response.data.verified) {
      // Store phone, verification status, and timestamp in localStorage
      localStorage.setItem("verifiedPhone", phone);
      localStorage.setItem("phoneVerified", "true");
      localStorage.setItem("verificationTimestamp", Date.now().toString());

      return { success: true };
    } else {
      return { success: false, error: "Incorrect OTP. Please try again." };
    }
  } catch (error) {
    return { success: false, error: "Verification failed. Please try again." };
  }
};

// Check if the stored phone verification has expired (1 hour expiry)
export const isPhoneVerificationExpired = () => {
  const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds
  const storedTimestamp = localStorage.getItem("verificationTimestamp");

  if (storedTimestamp && Date.now() - parseInt(storedTimestamp, 10) > ONE_HOUR) {
    localStorage.removeItem("verifiedPhone");
    localStorage.removeItem("phoneVerified");
    localStorage.removeItem("verificationTimestamp");
    return true;
  }

  return false;
};

// Check if phone number is already verified
export const getVerifiedPhone = () => {
  const storedPhone = localStorage.getItem("verifiedPhone");
  const storedPhoneVerified = localStorage.getItem("phoneVerified");

  if (storedPhone && storedPhoneVerified === "true" && !isPhoneVerificationExpired()) {
    return storedPhone;
  }

  return null;
};