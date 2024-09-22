'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './Navigation.module.css';
import { useRouter } from 'next/navigation';

const AdminNavigation = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showMenu, setShowMenu] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    
    const router = useRouter();

    const handleToggleClick = () => {
        setShowMenu(!showMenu);
    };

    const handleSearchInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchTerm(value);

        if (value.length > 0) {
            // Simulate search logic here
            console.log("Searching for:", value); // Replace with actual search API call
        } else {
            setSearchResults([]);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setSearchResults([]);
    };

    const handleSearchIconClick = () => {
        setIsSearchVisible(!isSearchVisible);
    };

    


    return (
        <>
            <header className={styles.header}>
                <nav className={styles.nav}>
                    <div className={styles.logo}>
                        <h1>Admin Logo</h1>
                        <button className={styles.toggleBtn} onClick={handleToggleClick}>
                            ☰
                        </button>
                    </div>

                    <div className={`${styles.searchBar} ${showMenu ? styles.show : styles.hidden}`}>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={handleSearchInput}
                            aria-label="Search"
                            className={styles.searchInput}
                        />
                        {searchTerm ? (
                            <img src='/Navbar/close.svg' className={styles.searchIcon} onClick={handleClearSearch} />
                        ) : (
                            <img className={styles.searchIcon} src='/Navbar/search.svg' onClick={handleSearchIconClick} />
                        )}
                       
                    </div>

                    <div className={`${styles.profileHeader} ${showMenu ? styles.show : styles.hidden}`}>
                        <Link className={styles.adminLogOutNav} href="/logout">
                            Logout
                        </Link>
                    </div>
                </nav>

                <ul className={`${styles.mainNavigationsUl} ${showMenu ? styles.show : styles.hidden}`}>
                    <li className={styles.mainNavigationsLi}>
                        <Link className={styles.listNav} href="/admin/dashboard">Admin Dashboard</Link>
                    </li>
                    <li className={styles.mainNavigationsLi}>
                        
                        <Link className={styles.categories} href="/admin/movieslist">movies</Link> <i className="fas fa-caret-down"></i>
                        

                    </li>
                    <li className={styles.mainNavigationsLi}>
                    
                        <Link className={styles.categories} href="/admin/theatreslist">Theaters</Link> <i className="fas fa-caret-down"></i>
                        
                    
                    </li>
                    <li className={styles.mainNavigationsLi}>
                        <Link className={styles.listNav} href="/admin/movieschedulelist">Movie Schedule</Link>
                    </li>
                </ul>
            </header>
        </>
    );
};

export default AdminNavigation;
