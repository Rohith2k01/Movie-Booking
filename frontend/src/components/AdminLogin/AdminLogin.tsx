"use client";

import React, { useReducer, useState } from 'react';
import axios from 'axios';
import styles from './AdminLogin.module.css';
import { useRouter } from 'next/navigation';


interface AdminLoginPopupProps {
  onClose: () => void;
}

const AdminLoginPopup: React.FC<AdminLoginPopupProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post('http://localhost:8080/api/admin/admin-login', { email, password });
      const data = response.data;
      
      if (data.success) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
            router.push('/admin/movieslist');
        }, 2000);
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <form onSubmit={handleSubmit}>
          <h2>Admin Login</h2>
          {success && <p className={styles.successMessage}>{success}</p>}
          {error && <p className={styles.errorMessage}>{error}</p>}
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.loginBtn}>Login</button>
          <button type="button" onClick={onClose} className={styles.closeButton}>X</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPopup;