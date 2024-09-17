    // frontend/components/signin-popup/SignUpPopup.tsx
    import React from 'react';
    import styles from './SignUp.module.css';

    

    const SignUpPopup: React.FC<{ toggleSignUpPopup: () => void }> = ({ toggleSignUpPopup }) => {
        const handleGoogleSignIn = () => {
          window.location.href = 'http://localhost:8080/api/auth/google';
        };
        return (
            <div className={styles.signUpPopupOverlay}>
                <div className={styles.signUpPopup}>
                    <button onClick={toggleSignUpPopup} className={styles.closePopup}>
                        &times;
                    </button>
                    <h2>Sign Up</h2>
                    <button onClick={handleGoogleSignIn} className={styles.signUpOption}>Sign Up with Google</button>
                    <button className={styles.signUpOption}>
                        <i className="fab fa-facebook"></i> Continue with Facebook
                    </button>
                </div>
            </div>
        );
    };

    export default SignUpPopup;
