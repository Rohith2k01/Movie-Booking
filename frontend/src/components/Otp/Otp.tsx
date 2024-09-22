// src/components/OTPInput.tsx

import React from "react";
import styles from "../../components/Otp/Otp.module.css";

interface OTPInputProps {
  length: number;
  onChange: (otp: string) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ length, onChange }) => {
  const [otp, setOtp] = React.useState<string[]>(Array(length).fill(""));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      onChange(newOtp.join(""));

      // Move focus to the next input if the value is not empty
      if (index < length - 1 && value) {
        (e.target.nextSibling as HTMLInputElement)?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && otp[index] === "") {
      // Type assertion to HTMLInputElement
      const target = e.target as HTMLInputElement;
      if (target.previousSibling && (target.previousSibling as HTMLInputElement).focus) {
        (target.previousSibling as HTMLInputElement).focus();
      }
    }
  };

  return (
    <div className={styles.otpContainer}>
      {otp.map((value, index) => (
        <input
          key={index}
          type="text"
          value={value}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          maxLength={1}
          className={styles.otpInput}
        />
      ))}
    </div>
  );
};

export default OTPInput;
