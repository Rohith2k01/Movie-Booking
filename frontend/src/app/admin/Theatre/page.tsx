"use client";

import React, { useState } from "react";
import axios from "axios";
import styles from '../../../styles/admin/Theatre.module.css';

const AddTheatre: React.FC = () => {
  const [theatreData, setTheatreData] = useState({
    theatreName: "",
    location: "",
    screenResolution: "2K" as '2K' | '4K',
    amenities: [] as string[],
    capacity: 0
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'select-one') {
      // Handle <select> changes
      setTheatreData(prevData => ({
        ...prevData,
        [name]: value
      }));
    } else {
      // Handle <input> and <textarea> changes
      setTheatreData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  const handleAmenitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setTheatreData(prevData => ({
      ...prevData,
      amenities: value.split(",").map(item => item.trim()) // Convert comma-separated string to array
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/api/admin/add-theatre", theatreData);

      if (response.status === 200) {
        setSuccessMessage("Theatre added successfully!");
        setTheatreData({
          theatreName: "",
          location: "",
          screenResolution: "2K",
          amenities: [],
          capacity: 0
        });
      }
    } catch (error) {
      setErrorMessage("Failed to add the theatre. Please try again.");
    }
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.addTheatreContainer}>
        <h2>Add a New Theatre</h2>
        {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
        {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}

        <form onSubmit={handleSubmit} className={styles.theatreForm}>
          <div className={styles.formGroup}>
            <label htmlFor="theatreName">Theatre Name:</label>
            <input
              type="text"
              id="theatreName"
              name="theatreName"
              value={theatreData.theatreName}
              onChange={handleChange}
              required
              className={styles.inputField}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="location">Location:</label>
            <input
              type="text"
              id="location"
              name="location"
              value={theatreData.location}
              onChange={handleChange}
              required
              className={styles.inputField}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="screenResolution">Screen Resolution:</label>
            <select
              id="screenResolution"
              name="screenResolution"
              value={theatreData.screenResolution}
              onChange={handleChange}
              required
              className={styles.inputField}
            >
              <option value="2K">2K</option>
              <option value="4K">4K</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="amenities">Amenities (comma-separated):</label>
            <input
              type="text"
              id="amenities"
              name="amenities"
              value={theatreData.amenities.join(",")} // Join array into a comma-separated string for input field
              onChange={handleAmenitiesChange}
              required
              className={styles.inputField}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="capacity">Capacity:</label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={theatreData.capacity}
              onChange={handleChange}
              required
              className={styles.inputField}
            />
          </div>

          <button type="submit" className={styles.submitButton}>Add Theatre</button>
        </form>
      </div>
    </div>
  );
};

export default AddTheatre;
