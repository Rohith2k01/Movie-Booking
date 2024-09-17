"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./booktickets.module.css";
import Seats from "@/components/SeatSelection/SeatSelection";
import Popup from "../book-tickets/components/popup/Popup"; // Import the Popup component
import { isAuthenticated } from "../../../Auth/auth"; // Import the authentication utility

type Movie = {
  title: string;
  genre: string;
  language: string;
  duration: string;
  releaseDate: string;
  rating: number;
};

type ShowTime = {
  time: string;
  seats: { seatNumber: string; isBooked: boolean }[];
};

type ShowDate = {
  date: string;
  times: ShowTime[];
};

type TheaterSchedule = {
  theatreName: string;
  location: string;
  movies: {
    movieTitle: string;
    genre: string;
    language: string;
    releaseDate: string;
    rating: number;
    showDates: ShowDate[];
  }[];
};

interface SelectedShowtime {
  theatreId: string;
  date: string;
  time: string;
}

type WeekdayButtons = {
  [date: string]: { dayName: string; dayNumber: number; month: string };
};

const timeCategories: { [key: string]: string[] } = {
  Morning: ["06:30", "10:00"],
  Afternoon: ["13:30", "16:00"],
  Evening: ["19:30"],
  Night: ["23:00"],
};

const MovieSchedule: React.FC = () => {
  const searchParams = useSearchParams();
  const movieId = searchParams.get("movieId");

  const router = useRouter();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [theaterSchedules, setTheaterSchedules] = useState<TheaterSchedule[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<TheaterSchedule[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [searchTheater, setSearchTheater] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("All");
  const [weekdays, setWeekdays] = useState<WeekdayButtons>({});
  const [selectedShowtime, setSelectedShowtime] = useState<SelectedShowtime | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false); // Manage popup state

  useEffect(() => {
    const fetchSchedule = async () => {
      if (movieId) {
        try {
          const response = await axios.get(`http://localhost:8080/api/book-tickets/${movieId}`);
          const scheduleData = response.data;

          if (scheduleData.length > 0) {
            const movieDetails = scheduleData[0]?.movies[0];

            setMovie({
              title: movieDetails.movieTitle || "N/A",
              genre: movieDetails.genre || "N/A",
              language: movieDetails.language || "N/A",
              duration: movieDetails.duration || "N/A",
              releaseDate: new Date(movieDetails.releaseDate).toLocaleDateString() || "N/A",
              rating: movieDetails.rating || "N/A",
            });

            setTheaterSchedules(scheduleData);
            setFilteredSchedules(filterByDate(scheduleData, selectedDate));
            setWeekdays(calculateWeekdays());
          }
        } catch (error) {
          setErrorMessage("Failed to fetch schedule details.");
        }
      }
    };

    fetchSchedule();
  }, [movieId]);

  const calculateWeekdays = (): WeekdayButtons => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const today = new Date();
    const currentDayIndex = today.getDay();
    const mondayOffset = currentDayIndex === 0 ? -6 : 1 - currentDayIndex;
    const monday = new Date(today.setDate(today.getDate() + mondayOffset));

    const weekdayButtons: WeekdayButtons = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const formattedDate = date.toISOString().split("T")[0];
      const dayName = days[i];
      const dayNumber = date.getDate();
      const month = date.toLocaleString('default', { month: 'long' });
      weekdayButtons[formattedDate] = { dayName, dayNumber, month };
    }
    return weekdayButtons;
  };

  useEffect(() => {
    filterSchedules();
  }, [selectedDate, searchTheater, selectedTime, theaterSchedules]);

  const filterByDate = (schedules: TheaterSchedule[], date: string): TheaterSchedule[] => {
    return schedules
      .map((schedule) => ({
        ...schedule,
        movies: schedule.movies
          .map((movie) => ({
            ...movie,
            showDates: movie.showDates.filter(
              (showDate) => new Date(showDate.date).toISOString().split("T")[0] === date
            ),
          }))
          .filter((movie) => movie.showDates.length > 0),
      }))
      .filter((schedule) => schedule.movies.length > 0);
  };

  const filterSchedules = () => {
    let filtered = theaterSchedules;

    filtered = filterByDate(filtered, selectedDate);

    if (searchTheater.trim() !== "") {
      filtered = filtered.filter((schedule) =>
        schedule.theatreName.toLowerCase().includes(searchTheater.toLowerCase())
      );
    }

    if (selectedTime !== "All") {
      const timesToInclude = timeCategories[selectedTime] || [];
      filtered = filtered.map((schedule) => ({
        ...schedule,
        movies: schedule.movies.map((movie) => ({
          ...movie,
          showDates: movie.showDates.map((showDate) => ({
            ...showDate,
            times: showDate.times.filter((time) =>
              timesToInclude.includes(time.time)
            ),
          })).filter((showDate) => showDate.times.length > 0),
        })).filter((movie) => movie.showDates.length > 0),
      })).filter((schedule) => schedule.movies.length > 0);
    }

    setFilteredSchedules(filtered);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTheater(event.target.value);
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTime(event.target.value);
  };

  const handleShowtimeClick = (theatreId: string, showDate: string, showTime: string) => {
    if (isAuthenticated()) {
      setSelectedShowtime({ theatreId, date: showDate, time: showTime });
    } else {
      setShowPopup(true); // Show the popup if not authenticated
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const handleLoginRedirect = () => {
    router.push('/login'); // Redirect to login page
  };

  const handleBackToSchedule = () => {
    setSelectedShowtime(null);
  };

  return (
    <section className={styles.scheduleSection}>
      {showPopup && (
        <Popup
          message="Please log in or register to book tickets."
          onClose={handlePopupClose}
         
         // Redirect to register page
        />
      )}
      {selectedShowtime ? (
        <div className={styles.seatsSection}>
          <button onClick={handleBackToSchedule} className={styles.backButton}>
            back
          </button>
          <Seats
            movieId={movieId!}
            theatreId={selectedShowtime.theatreId}
            showDate={selectedShowtime.date}
            showTime={selectedShowtime.time}
          />
        </div>
      ) : (
        <>
          <div className={styles.movieHeader}>
            <h2>{movie?.title}</h2>
            {movie?.genre?.split(',').map((g, index) => (
              <span className={styles.genre} key={index}>
                {g.trim()}{index < (movie.genre?.split(',').length ?? 0) - 1 ? ' ' : ''}
              </span>
            ))}

            <p>{movie?.language} | {movie?.duration} </p>
            <p>Rating: {movie?.rating} | Release Date: {movie?.releaseDate}</p>
          </div>

          <div className={styles.filters}>
            <div className={styles.weekdaySliderDiv}>
              <button className={`${styles.arrow} ${styles.left}`} >&lt;</button>
              <div className={styles.weekdaySlider}>

                {Object.entries(weekdays).map(([date, { dayName, dayNumber, month }]) => (
                  <div
                    key={date}
                    className={`${styles.weekdayButton} ${selectedDate === date ? styles.active : ""}`}
                    onClick={() => handleDateChange(date)}
                  >
                    <div>{dayName}</div>
                    <div>{dayNumber}</div>
                    <div>{month}</div>
                  </div>
                ))}

              </div>
              <button className={`${styles.arrow} ${styles.right}`}>&gt;</button>
            </div>
            <div>

              <input
                type="text"
                placeholder="Search by cinemas ..."
                value={searchTheater}
                onChange={handleSearchChange}
                className={styles.filterInput}
              />

              <select value={selectedTime} onChange={handleTimeChange} className={styles.filterSelect}>
                <option value="All">All Times</option>
                {Object.keys(timeCategories).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

            </div>
          </div>

          <div className={styles.scheduleList}>
            {!filteredSchedules ? (
              <p>Loading schedules...</p> // Display loading message when data is undefined or not yet available
            ) : filteredSchedules.length === 0 ? (
              <p className={styles.noSchedules}>No schedules found. Please try again later.</p> // Display error message if no schedules are available
            ) : (
              filteredSchedules.map((schedule) => (
                <div key={schedule.theatreName} className={styles.theatreContainer}>
                  <h3>
                    {schedule.theatreName} - {schedule.location}
                  </h3>
                  {schedule.movies.map((movie) => (
                    <div key={movie.movieTitle} className={styles.movieContainer}>
                      {movie.showDates.map((showDate) => (
                        <div key={showDate.date} className={styles.showDateContainer}>
                          <h5>{new Date(showDate.date).toDateString()}</h5>
                          <div className={styles.showTimes}>
                            {showDate.times.map((showTime, index) => (
                              <button
                                key={index}
                                onClick={() =>
                                  handleShowtimeClick(
                                    schedule.theatreName,
                                    showDate.date,
                                    showTime.time
                                  )
                                }
                                className={styles.showtimeButton}
                              >
                                {showTime.time}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default MovieSchedule;
