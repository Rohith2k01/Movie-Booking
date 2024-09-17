//auth.ts
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth'; // Adjust to your backend URL

export interface User {
    firstname?: string;
    lastname?: string;
    email?: string;
    photo?: string;
}

export const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('authToken');
    console.log('Token retrieved from localStorage:', token);
    return !!token;
};

export const getUser = async (): Promise<User | null> => {
    const token = localStorage.getItem('authToken');
    console.log('Token used for request:', token);
    if (!token) return null;

    try {
        const response = await axios.get(`${API_URL}/user-details`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('User data retrieved:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching user details:', error);
        return null;
    }
};


setTimeout(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    console.log("Auth token and user data have been removed due to expiration.");
}, 3600000); // 1 hour = 3600000 milliseconds

export const logout = (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData'); // Clear user data if stored
};

