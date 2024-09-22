"use client"

// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  firstname?: string;
  lastname?: string;
  email?: string;
  photo?: string;
}

const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchUser = async () => {
        try {
          const token = localStorage.getItem('token');
          const userData = localStorage.getItem('user');
          console.log("Token:", token); // Debugging
          console.log("User Data:", userData); // Debugging
  
          if (token && userData) {
            const response = await axios.post('http://localhost:8080/api/user-details', { token });
            console.log("User data from API:", response.data); // Debugging
            setUser(response.data);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user details:", error); // More detailed error
          setUser(null);
        } finally {
          setLoading(false);
        }
      };
  
      fetchUser();
    }, []);
  
    return { user, loading };
  };
  
  export default useAuth;