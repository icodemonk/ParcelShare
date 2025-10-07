import { Link } from 'react-router-dom';
import { useState } from 'react';
import '../Css/ParcelNav.css';

export default function GuestNav() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="guest-nav">
            <div className="nav-container">
                {/* Logo */}
                <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
                    ParcelShare
                </Link>

                {/* Desktop Navigation Links */}
                <div className="nav-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/about" className="nav-link">About</Link>
                    <Link to="/features" className="nav-link">Features</Link>
                    <Link to="/pricing" className="nav-link">Pricing</Link>
                </div>

                {/* Desktop Action Buttons */}
                <div className="nav-actions">
                    <Link to="/login" className="sign-in-link">Sign In</Link>
                    <Link to="/signup" className="sign-up-button">Sign Up</Link>

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
                    <li><Link to="/about" className="mobile-nav-link" onClick={closeMobileMenu}>About</Link></li>
                    <li><Link to="/features" className="mobile-nav-link" onClick={closeMobileMenu}>Features</Link></li>
                    <li><Link to="/pricing" className="mobile-nav-link" onClick={closeMobileMenu}>Pricing</Link></li>
                </ul>

                <div className="mobile-nav-actions">
                    <Link to="/login" className="mobile-sign-in" onClick={closeMobileMenu}>Sign In</Link>
                    <Link to="/signup" className="mobile-sign-up" onClick={closeMobileMenu}>Sign Up</Link>
                </div>
            </div>
        </nav>
    );
}