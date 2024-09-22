import React, { useState } from 'react';
import styles from './Popup.module.css';
import SignUpPopup from '../../../../../components/Navigation/components/signin/SignUp'; // Import the SignUpPopup component

interface PopupProps {
  message: string;
  onClose: () => void;

}

const Popup: React.FC<PopupProps> = ({ message, onClose}) => {
  const [showSignUpPopup, setShowSignUpPopup] = useState(false);

  const handleSignUpClick = () => {
    setShowSignUpPopup(true); // Set state to true when "Sign Up" is clicked
  };
  const toggleSignUpPopup = () => {
    setShowSignUpPopup(!showSignUpPopup);
};


  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        {!showSignUpPopup ? (
          // Show original popup content if SignUpPopup is not visible
          <>
            <p className={styles.popUpMessage}>{message}</p>
            <button onClick={handleSignUpClick} className={styles.signUpBtn}>
              <i className="fas fa-user"></i> Sign Up
            </button>
            
            <button onClick={onClose} className={styles.closeButton}>
              X
            </button>
          </>
        ) : (
          // Show SignUpPopup component when "Sign Up" is clicked
         <SignUpPopup toggleSignUpPopup={toggleSignUpPopup} />
        )}
      </div>
    </div>
  );
};

export default Popup;