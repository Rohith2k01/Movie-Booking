import axios from 'axios';

export const fetchUserDetails = async (token: string) => {
  try {
    const response = await axios.post('http://localhost:8080/api/auth/user-details', { token });
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};
