"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import styles from '../../../styles/admin/theatreList.module.css';

interface Theatre {
    _id: string;
    theatreName: string;
    location: string;
    screenResolution: '2K' | '4K';
    amenities: string[];
    capacity: number;
}

const TheatreList: React.FC = () => {
    const [theatres, setTheatres] = useState<Theatre[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const router = useRouter();

    useEffect(() => {
        const fetchTheatres = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/admin/theatre-list');
                setTheatres(response.data);
            } catch (error) {
                setErrorMessage('Failed to fetch theatres. Please try again later.');
            }
        };
        fetchTheatres();
    }, []);

    const handleDelete = async (theatreId: string) => {
        try {
            await axios.delete(`http://localhost:8080/api/admin/theatre-delete/${theatreId}`);
            setTheatres(theatres.filter((theatre) => theatre._id !== theatreId));
        } catch (error) {
            setErrorMessage('Failed to delete the theatre. Please try again.');
        }
    };

    return (
        <section className={styles.mainSection}>
            <div className={styles.container}>
           <div className={styles.fixedContainer}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Theatre List</h2>
                    <button className={styles.addButton} onClick={() => router.push('/admin/add-theatre')}>Add Theatre</button>
                    </div>
                    <div className={styles.theatreCardHeading}>
                                    <div className={styles.cardRow}>
                                        <span className={styles.index}>#</span>
                                        <span>Name</span>
                                        <span>Location</span>
                                        <span>Resolution</span>
                                        <span>capacity</span>
                                        <span>amenities</span>
                                        <div className={styles.cardActions} style={{opacity:"0"}}>
                                            <button className={styles.deleteButton} >
                                                Delete
                                            </button>
                                            <button className={styles.editButton}>Edit</button>
                                        </div>
                                        
                                    </div>  
                                    
            
                        </div>
                </div>
                {errorMessage && <div className={styles.error}>{errorMessage}</div>}
                {theatres.length > 0 ? (
                    
                    <div>
                       
                                
                                
                        <div className={styles.cardContainer}>
                            {theatres.map((theatre, index) => (
                                <div className={styles.theatreCard} key={theatre._id}>
                                    <div className={styles.cardRow}>
                                        <span className={styles.index}>{index + 1}</span>
                                        <span>{theatre.theatreName}</span>
                                        <span>{theatre.location}</span>
                                        <span>{theatre.screenResolution}</span>
                                        <span>{theatre.capacity}</span>
                                        <span>{theatre.amenities.join(', ')}</span>
                                        <div className={styles.cardActions}>
                                            <button onClick={() => handleDelete(theatre._id)} className={styles.deleteButton}>
                                                Delete
                                            </button>
                                            <button className={styles.editButton}>Edit</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <h3 className={styles.emptyMessage}>No theatres available</h3>
                )}
            </div>
        </section>
    );
};

export default TheatreList;
