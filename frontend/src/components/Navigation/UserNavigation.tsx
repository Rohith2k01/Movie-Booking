import Link from 'next/link';
import axios from 'axios';
import { useState, useEffect } from 'react';
import styles from './Navigation.module.css';
import SignUpPopup from './components/signin/SignUp';
import { getUser, isAuthenticated, logout, User } from '../../Auth/auth';
import { useRouter } from 'next/navigation';

interface Movie {
    _id: string;
    title: string;
}

const UserNavigation = () => {
    const [user, setUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSignUpPopup, setShowSignUpPopup] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchResults, setSearchResults] = useState<Movie[]>([]);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            if (isAuthenticated()) {
                const userData = await getUser();
                setUser(userData);
            } else {
                setUser(null);
            }
        };

        fetchUser();
    }, []);

    const handleToggleClick = () => {
        setShowMenu(!showMenu);
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userDetails = urlParams.get('user');
        if (token && userDetails) {
            localStorage.setItem('authToken', token);
            localStorage.setItem('userData', userDetails);
            console.log(userDetails);
        }
    }, []);

    const handleClearSearch = () => {
        setSearchTerm("");
        setSearchResults([]);
    };

    const handleSearchInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchTerm(value);

        if (value.length > 0) {
            try {
                const response = await axios.get(`http://localhost:8080/api/search-movies?title=${value}`);
                setSearchResults(response.data);
            } catch (error) {
                console.error("Error searching for movies:", error);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleMovieClick = (movieId: string) => {
        router.push(`/user/moviedetails?movieId=${movieId}`);
        setSearchTerm("");
        setSearchResults([]);
    };

    const toggleSignUpPopup = () => {
        setShowSignUpPopup(!showSignUpPopup);
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleLogout = () => {
        logout();
        setUser(null);
        router.push('/');
    };

    const handleSearchIconClick = () => {
        setIsSearchVisible(!isSearchVisible);
    };

    return (
        <>
            <header className={styles.header}>
                <nav className={styles.nav}>
                    <div className={styles.logo}>
                        <h1>Movie Booking</h1>
                        <button className={styles.toggleBtn} onClick={handleToggleClick}>
                    ☰ 
                </button>
                    </div>
                   
                    <div className={`${styles.searchBar} ${showMenu ? styles.show : styles.hidden}`}  >
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
                            <img className={styles.searchIcon} src='/Navbar/search.svg' onClick={handleSearchIconClick}/>
                        )}
                        {searchResults.length > 0 && (
                            <div className={styles.searchResults}>
                                {searchResults.map((movie) => (
                                    <div
                                        key={movie._id}
                                        className={styles.searchResultItem}
                                        onClick={() => handleMovieClick(movie._id)}
                                    >
                                        {movie.title}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={`${styles.profileHeader} ${showMenu ? styles.show : styles.hidden}`} onClick={toggleDropdown}>
                        {user ? (
                            <div className={styles.profileIcon}>
                                {user.photo ? (
                                    <img src={user.photo} alt={user.firstname} className={styles.profilePhoto} />
                                ) : (
                                    <i className="fas fa-user-circle"></i>
                                )}
                                <span>{user.firstname}</span>
                                <div className={`${styles.profileDropdown} ${showDropdown ? styles.showDropdown : ''}`}>
                                    <Link href="/profile">Account Settings</Link>
                                    <Link href="/user/emailverification">Two Factor Authentication</Link>
                                    <a onClick={handleLogout}>Logout</a>
                                </div>
                            </div>
                        ) : (
                            <button onClick={toggleSignUpPopup} className={styles.signUpBtn}>
                                <i className="fas fa-user"></i> Sign Up
                            </button>
                        )}
                    </div>
                </nav>

               
                <ul className={`${styles.mainNavigationsUl} ${showMenu ? styles.show : styles.hidden}`}>
                    <li className={`${styles.mainNavigationsLi}`}>
                        <Link className={styles.listNav} href="/">Home</Link>
                    </li>
                    <li className={`${styles.mainNavigationsLi}`}>
                        <Link className={styles.listNav} href="/user/movielist">Movie List</Link>
                    </li>
                    {/* <li className={styles.mainNavigationsLi}>
                            <a className={styles.categories}>Categories <i className="fas fa-caret-down"></i></a>
                            <div className={styles.categoriesItems}>
                                <p><Link href="/category1">Category 1</Link></p>
                                <p><Link href="/category2">Category 2</Link></p>
                                <p><Link href="/category3">Category 3</Link></p>
                                <p><Link href="/category4">Category 4</Link></p>
                                <p><Link href="/category5">Category 5</Link></p>
                            </div>
                        </li> */}
                    {/* Add more items here if needed */}
                </ul>
            </header>

            {showSignUpPopup && <SignUpPopup toggleSignUpPopup={toggleSignUpPopup} />}
        </>
    );
};

export default UserNavigation;
