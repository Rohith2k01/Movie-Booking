"use client";
import React from "react";
import styles from "./Verification.module.css";

interface PopUpVerificationProps {
  onClose: () => void;
  onProceed: () => void;
  verificationType: "email" | "phone";
  success?: boolean; // Add success prop
}

const PopUpVerification: React.FC<PopUpVerificationProps> = ({
  onClose,
  onProceed,
  verificationType,
  success
}) => {
  return (
    <div className={styles.popupOverlay}>
      {success ? (
        <div className={styles.popupContainer}>
          <h2 className={styles.popHeading}>Verification Successful!</h2>
          <p className={styles.popDescription}>
            Your {verificationType} has been successfully verified. You can now proceed to use the application.
          </p>
          <div className={styles.buttonGroup}>
            <button onClick={onProceed} className={styles.proceedButton}>
              Ok
            </button>
          </div>
        </div>
      ) : (
        <>
          {verificationType === 'email' && (
            <p className={styles.text}>
              The User Registration has been successfully completed. For enhanced security, please also verify your Email.
            </p>
          )}
          {verificationType === 'phone' && (
            <p className={styles.text}>
              Email verification has been successfully completed. For enhanced security, please also verify your phone number.
            </p>
          )}

          <div className={styles.popupContainer}>
            <h2 className={styles.popHeading}>Please Verify Your {verificationType.charAt(0).toUpperCase() + verificationType.slice(1)}</h2>
            <p className={styles.popDescription}>A {verificationType} verification is required to proceed. Please verify your {verificationType} to continue.</p>
            <div className={styles.buttonGroup}>
              <button onClick={onProceed} className={styles.proceedButton}>
                Ok
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PopUpVerification;
