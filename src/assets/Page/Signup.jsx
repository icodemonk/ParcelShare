import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../Css/Signup.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: 'ROLE_PARCEL'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear errors when user starts typing
        if (error) setError('');
        if (success) setSuccess('');
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError('Full name is required');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Email is required');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        if (!formData.username.trim()) {
            setError('Username is required');
            return false;
        }
        if (formData.username.length < 3) {
            setError('Username must be at least 3 characters long');
            return false;
        }
        if (!formData.password) {
            setError('Password is required');
            return false;
        }
        if (formData.password.length < 4) {
            setError('Password must be at least 4 characters long');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (!formData.role) {
            setError('Please select a role');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                username: formData.username,
                password: formData.password,
                role: formData.role
            };

            console.log('Sending signup request:', payload);

            const response = await axios.post(
                'http://localhost:8080/api/auth/register',
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Signup response:', response.data);

            setSuccess('Account created successfully! Redirecting to login...');

            // Reset form
            setFormData({
                name: '',
                email: '',
                username: '',
                password: '',
                confirmPassword: '',
                role: 'ROLE_PARCEL'
            });

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            console.error('Signup error:', error);
            if (error.response?.data) {
                setError(error.response.data || 'Registration failed. Please try again.');
            } else if (error.message === 'Network Error') {
                setError('Network error. Please check your connection and try again.');
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const getRoleDescription = (role) => {
        switch (role) {
            case 'ROLE_PARCEL':
                return 'Send parcels and find travelers for delivery';
            case 'ROLE_TRAVELER':
                return 'Deliver parcels and earn money while traveling';
            default:
                return '';
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                <div className="signup-header">
                    <div className="signup-logo">
                        <span className="logo-icon">📦</span>
                        ParcelShare
                    </div>
                    <h1 className="signup-title">Create Your Account</h1>
                    <p className="signup-subtitle">Join our community and start sharing parcels today</p>
                </div>

                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="form-input"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-input"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="username" className="form-label">
                                Username *
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                className="form-input"
                                placeholder="Choose a username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                            <div className="input-help">Must be at least 3 characters long</div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password *
                            </label>
                            <div className="password-input-container">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    className="form-input"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={togglePasswordVisibility}
                                    disabled={loading}
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                            <div className="input-help">Must be at least 4 characters long</div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">
                                Confirm Password *
                            </label>
                            <div className="password-input-container">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    className="form-input"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={toggleConfirmPasswordVisibility}
                                    disabled={loading}
                                >
                                    {showConfirmPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="role" className="form-label">
                                I want to *
                            </label>
                            <div className="role-selection">
                                <div className="role-option">
                                    <input
                                        type="radio"
                                        id="role_parcel"
                                        name="role"
                                        value="ROLE_PARCEL"
                                        checked={formData.role === 'ROLE_PARCEL'}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="role-radio"
                                    />
                                    <label htmlFor="role_parcel" className="role-label">
                                        <span className="role-icon">📤</span>
                                        <div className="role-content">
                                            <div className="role-title">Send Parcels</div>
                                            <div className="role-description">
                                                Find travelers to deliver your parcels
                                            </div>
                                        </div>
                                    </label>
                                </div>
                                <div className="role-option">
                                    <input
                                        type="radio"
                                        id="role_traveler"
                                        name="role"
                                        value="ROLE_TRAVELER"
                                        checked={formData.role === 'ROLE_TRAVELER'}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="role-radio"
                                    />
                                    <label htmlFor="role_traveler" className="role-label">
                                        <span className="role-icon">🚗</span>
                                        <div className="role-content">
                                            <div className="role-title">Deliver Parcels</div>
                                            <div className="role-description">
                                                Earn money by delivering parcels while traveling
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div className="role-help">
                                {getRoleDescription(formData.role)}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="signup-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="button-spinner"></div>
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>

                    {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="success-message">
                            <span className="success-icon">✅</span>
                            {success}
                        </div>
                    )}
                </form>

                <div className="signup-footer">
                    <p className="signup-footer-text">
                        Already have an account?{' '}
                        <Link to="/login" className="signup-link">
                            Sign in
                        </Link>
                    </p>
                </div>

                <div className="signup-features">
                    <div className="feature">
                        <span className="feature-icon">🔒</span>
                        <span className="feature-text">Secure & Private</span>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">⚡</span>
                        <span className="feature-text">Fast Delivery</span>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">💸</span>
                        <span className="feature-text">Save Money</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;