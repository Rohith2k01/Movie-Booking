"use client";

import React, { useEffect, useState } from 'react';
import styles from './Banner.module.css';
import Link from 'next/link';

// Simulate data fetching from the backend (admin panel provides the data)
const fetchCarouselData = async () => {
  // In a real app, you would fetch this from the backend
  return [
    {
      id: 1,
      src: "/1.jpeg",
      title: "Interstellar",
      rating: 4.5,
      description: "A group of astronauts embarks on a mission through a wormhole to find a new habitable planet for humanity.",
    },
    {
      id: 2,
      src: "/2.jpg",
      title: "Inception",
      rating: 4.7,
      description: "A skilled thief enters the dreams of others to plant an idea in their subconscious, blurring the line between reality and illusion",
    },
    {
      id: 3,
      src: "/3.jpeg",
      title: "Shutter Island",
      rating: 4.9,
      description: " A U.S Marshal investigates the disappearance of a patient from a secluded psychiatric hospital, uncovering dark secrets and questioning his own sanity.",
    },
  ];
};

const Carousel: React.FC = () => {
  const [carouselData, setCarouselData] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchCarouselData();
      setCarouselData(data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselData.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [carouselData]);

  if (!carouselData.length) return null; // Return null if there's no data

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.carousel}>
        <div
          className={styles.carouselImages}
          style={{ transform: `translateX(${-currentIndex * 100}%)` }}
        >
          {carouselData.map((movie, index) => (
            <div key={index} className={styles.carouselSlide}>
              <img src={movie.src} alt={movie.title} />
              <div className={styles.carouselOverlay}>
                <h2>{movie.title}</h2>
                <p>Rating: {movie.rating}</p>
                <p>{movie.description}</p>
                <Link href={`/book-now/${movie.id}`}>
                  <button className={styles.bookNowButton}>Book Now</button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.carouselDots}>
          {carouselData.map((_, index) => (
            <div
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
              onClick={() => setCurrentIndex(index)}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
