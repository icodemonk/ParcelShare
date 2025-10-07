import { Link } from 'react-router-dom';
import { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext/AuthContext';
import '../Css/ParcelNav.css';

export default function ParcelNav() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isAuthenticated, removeUser, getUserRole ,getUserId } = useContext(AuthContext);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        removeUser();
        closeMobileMenu();
        window.location.href = '/';
    };

    return (
        <nav className="parcel-nav">
            <div className="nav-container">
                {/* Logo */}
                <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
                    ParcelShare
                </Link>

                {/* Desktop Navigation Links */}
                <div className="nav-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/addparcel" className="nav-link">Add-Parcel</Link>
                    <Link to="/suggestion" className="nav-link">Request-Received</Link>
                    <Link to="/prequest" className="nav-link">Accepted-Request</Link>
                    <Link to="/parcel-matched" className="nav-link">Match</Link>
                </div>

                {/* Desktop Action Buttons */}
                <div className="nav-actions">
                    {isAuthenticated() ? (
                        <>
                            <span className="user-welcome">Welcome, {getUserRole()} , {getUserId()} </span>
                            <button onClick={handleLogout} className="logout-button">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="sign-in-link">Sign In</Link>
                            <Link to="/signup" className="sign-up-button">Sign Up</Link>
                        </>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        className="mobile-menu-button"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle navigation menu"
                        aria-expanded={isMobileMenuOpen}
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                <ul className="mobile-nav-links">
                    <li><Link to="/" className="mobile-nav-link" onClick={closeMobileMenu}>Home</Link></li>
                    <li><Link to="/suggestion" className="mobile-nav-link" onClick={closeMobileMenu}>Suggestions</Link></li>
                    <li><Link to="/addparcel" className="mobile-nav-link" onClick={closeMobileMenu}>Add-Parcel</Link></li>
                    <li><Link to="/prequest" className="mobile-nav-link" onClick={closeMobileMenu}>Request</Link></li>
                    <li><Link to="/parcel-matched" className="mobile-nav-link" onClick={closeMobileMenu}>Match</Link></li>
                </ul>

                <div className="mobile-nav-actions">
                    {isAuthenticated() ? (
                        <>
                            <span className="mobile-user-welcome">Welcome, {getUserRole()}</span>
                            <button onClick={handleLogout} className="mobile-logout-button">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="mobile-sign-in" onClick={closeMobileMenu}>Sign In</Link>
                            <Link to="/signup" className="mobile-sign-up" onClick={closeMobileMenu}>Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}