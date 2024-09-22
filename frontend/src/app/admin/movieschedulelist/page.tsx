"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../../styles/admin/movieScheduleList.module.css";
import { useRouter } from "next/navigation";

interface ShowTime {
  time: string;
  seats: {
    seatNumber: string;
    isBooked: boolean;
  }[];
}

interface ShowDate {
  date: string;
  times: ShowTime[];
}

interface Movie {
  _id: string;
  title: string;
}

interface Theatre {
  _id: string;
  theatreName: string;
}

interface Schedule {
  _id: string;
  theatre: Theatre;
  movies: {
    movie: Movie;
    showDates: ShowDate[];
  }[];
}

const ScheduleList: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/admin/schedule-details"
        );
        console.log(response.data); // Check if the data format is correct
        setSchedules(response.data);
      } catch (error) {
        setErrorMessage("Failed to fetch schedules.");
      }
    };
    fetchSchedules();
  }, []);

  // Group schedules by theatre name
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const theatreName = schedule.theatre.theatreName;
    if (!acc[theatreName]) {
      acc[theatreName] = [];
    }
    acc[theatreName].push(schedule);
    return acc;
  }, {} as { [theatreName: string]: Schedule[] });

  // Handle deleting showtimes
  const handleDeleteShowtime = async (scheduleId: string, movieId: string, date: string, time: string) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/admin/schedule/${scheduleId}/showtime`,
        { data: { movieId, date, time } } // Send movieId, date, and time in request body
      );
  
      // Update schedules in the state after deletion
      setSchedules((prevSchedules) =>
        prevSchedules
          .map((schedule) => {
            if (schedule._id === scheduleId) {
              const updatedMovies = schedule.movies.map((movieSchedule) => {
                if (movieSchedule.movie?._id === movieId) {
                  const updatedShowDates = movieSchedule.showDates
                    .map((showDate) => ({
                      ...showDate,
                      times: showDate.times.filter((t) => t.time !== time),
                    }))
                    .filter((showDate) => showDate.times.length > 0); // Remove empty dates
  
                  return { ...movieSchedule, showDates: updatedShowDates };
                }
                return movieSchedule;
              }).filter((movieSchedule) => movieSchedule.showDates.length > 0); // Remove movies with no showtimes
  
              return { ...schedule, movies: updatedMovies };
            }
            return schedule;
          })
          .filter((schedule) => schedule.movies.length > 0) // Remove schedules with no movies
      );
    } catch (error) {
      setErrorMessage("Failed to delete showtime.");
    }
  };
  

  return (
    <div className={styles.mainSection}>
      <div className={styles.container}>
        <div className={styles.headingWithButton}>
        <h2>Movie Schedules</h2>
        <button className={styles.addButton} onClick={() =>  router.push('/admin/movieschedule')}>Add Schedule</button>
        </div>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}

        <div className={styles.cardContainer}>
          {Object.keys(groupedSchedules).length > 0 ? (
            Object.keys(groupedSchedules).map((theatreName, index) => (
              <div key={theatreName} className={styles.theatreCard}>
                <h3>
                  {index + 1}. {theatreName}
                </h3>
                
                {groupedSchedules[theatreName].map((schedule) => (
                  <div key={schedule._id} className={styles.movieCard}>
                    <div className={styles.movieContent}>
                      <div className={styles.movieHeader}>
                        <h4 className={styles.movieTitle}>
                          {/* {schedule.movies.map(movieSchedule => movieSchedule.movie.title).join(', ')} */}
                          {schedule.movies
                          .filter(movieSchedule => movieSchedule.movie) // Filter out null movieSchedule.movie
                          .map(movieSchedule => movieSchedule.movie.title)
                          .join(', ') || 'No Movies Available'}
                        </h4>
                        
                      </div>

                      <div className={styles.movieDetails}>
                        {schedule.movies.filter(movieSchedule => movieSchedule.movie).map((movieSchedule) => (
                          <div key={movieSchedule.movie._id} className={styles.movieDetailsSection}>
                          
                            {Array.isArray(movieSchedule.showDates) && movieSchedule.showDates.length > 0 ? (
                              movieSchedule.showDates
                                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                .map((showDate) => (
                                  <div key={showDate.date} className={styles.dateCard}>
                                    <strong>Date: {showDate.date}</strong>
                                    {showDate.times
                                      .sort((a, b) => a.time.localeCompare(b.time)) // Sort times in ascending order
                                      .map((showTime) => (
                                        <div key={`${showDate.date}-${showTime.time}`} className={styles.showtime}>
                                          <span>{showTime.time}</span>
                                          <img
                                            src="/admin/trash.svg"
                                            alt="Delete Showtime"
                                            className={styles.deleteIcon}
                                            onClick={() => handleDeleteShowtime(schedule._id, movieSchedule.movie._id, showDate.date, showTime.time)}
                                          />
                                        </div>
                                  ))}
                                  </div>
                                ))
                            ) : (
                              <p>No showtimes available for this schedule.</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <p className={styles.emptyMessage}>No schedules available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleList;
